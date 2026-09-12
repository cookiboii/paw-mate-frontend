// src/api/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { unwrapResult } from './apiHelper';
import { clearAuthStorage, getAccessToken, getRefreshToken, updateAuthTokens } from '../utils/authStorage';

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
    const token = getAccessToken();
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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig | undefined;
    logUnauthorized(error, 'response interceptor');

    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      // 로그인/회원가입 요청 실패 시에는 리프레시를 시도하지 않음
      const url = originalRequest.url || '';
      const isPublicAuthRequest = /\/(login|register|verify-email|verify-code|send-reset-code|verify-reset-code|refresh-token)(?:[/?]|$)/.test(url);
      if (url.includes('/login') || url.includes('/refresh-token') || isPublicAuthRequest) {
        return Promise.reject(error);
      }
      if (!refreshToken) {
        clearAuthStorage();
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
        const refreshed = unwrapResult<{ token?: string; accessToken?: string; refreshToken?: string }>(res.data);
        const newToken = refreshed?.token || refreshed?.accessToken;
        const newRefreshToken = refreshed?.refreshToken;

        if (newToken) {
          updateAuthTokens(newToken, newRefreshToken);
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
        clearAuthStorage();
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
