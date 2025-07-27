// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // API 서버 주소
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log('✅ 현재 토큰:', token); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // 토큰 자동 포함
  }
  return config;
});

export default axiosInstance;





