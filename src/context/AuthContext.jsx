import { createContext, useContext, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [user, setUser] = useState(() => {
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const provider = localStorage.getItem('provider');
    return role ? { role, email, name, provider } : null;
  });

  const login = (token, userInfo = {}, refreshToken = null) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (userInfo.role) localStorage.setItem('role', userInfo.role);
    if (userInfo.email) localStorage.setItem('email', userInfo.email);
    if (userInfo.name) localStorage.setItem('name', userInfo.name);
    if (userInfo.provider) localStorage.setItem('provider', userInfo.provider);
    setIsAuthenticated(true);
    setUser(userInfo);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // 백엔드 로그아웃 API 호출 (Redis 토큰 삭제 및 블랙리스트 등록)
        await axiosInstance.post('/adoptmate/logout');
      }
    } catch (err) {
      console.warn('백엔드 로그아웃 처리 중 알림:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('provider');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

