// src/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { unwrapResult } from './apiHelper';

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const logUnauthorized = (error: AxiosError, source: string) => {
  if (error.response?.status !== 401) return;

  const config = error.config as CustomInternalAxiosRequestConfig | undefined;
  console.log('[API 401]', {
    source,
    method: config?.method?.toUpperCase(),
    url: config?.url?.split(/[?#]/)[0],
    status: error.response.status,
    isRetry: Boolean(config?._retry),
    hasAuthorization: Boolean(config?.headers?.Authorization),
  });
};

// 📌 Request 인터셉터: 헤더에 JWT 토큰 자동 첨부
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      config.headers.delete('Authorization');
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 📌 Response 인터셉터: 401 발생 시 refreshToken을 이용한 토큰 자동 재발급
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  localStorage.removeItem('name');
  localStorage.removeItem('provider');
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig | undefined;
    logUnauthorized(error, 'response interceptor');

    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');

      // 로그인/회원가입 요청 실패 시에는 리프레시를 시도하지 않음
      const url = originalRequest.url || '';
      const isPublicAuthRequest = /\/(login|register|verify-email|verify-code|send-reset-code|verify-reset-code|refresh-token)(?:[/?]|$)/.test(url);
      if (url.includes('/login') || url.includes('/refresh-token') || isPublicAuthRequest) {
        return Promise.reject(error);
      }
      if (!refreshToken) {
        clearAuthData();
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 재발급 API 호출: POST /adoptmate/refresh-token
        const res = await axios.post(`${BASE_URL}/adoptmate/refresh-token`, { refreshToken });
        const refreshed = unwrapResult<{ token?: string; accessToken?: string }>(res.data);
        const newToken = refreshed?.token || refreshed?.accessToken;

        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        }

        throw new Error('토큰 재발급 응답에 Access Token이 없습니다.');
      } catch (refreshError) {
        if (axios.isAxiosError(refreshError)) {
          logUnauthorized(refreshError, 'token refresh');
        }
        processQueue(refreshError, null);
        clearAuthData();
        // 📢 전역 AuthContext에 세션 만료 이벤트 전파
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
