// src/api/axiosInstance.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// 📌 Request 인터셉터: 헤더에 JWT 토큰 자동 첨부
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// 📌 Response 인터셉터: 401 발생 시 refreshToken을 이용한 토큰 자동 재발급
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
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
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  localStorage.removeItem('name');
  localStorage.removeItem('provider');
};

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      // 로그인/회원가입 요청 실패 시에는 리프레시를 시도하지 않음
      if (!refreshToken || originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 재발급 API 호출: POST /adoptmate/refresh-token
        const res = await axios.post(`${BASE_URL}/adoptmate/refresh-token`, { refreshToken });
        const newToken = res.data.result?.token || res.data.token;

        if (newToken) {
          localStorage.setItem('token', newToken);
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
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
