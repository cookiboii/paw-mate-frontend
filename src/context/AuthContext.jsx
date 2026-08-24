import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast } from './ToastContext';

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

  const { showToast } = useToast();

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

  const logout = async (callApi = true) => {
    if (callApi) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // 백엔드 로그아웃 API 호출 (Redis 토큰 삭제 및 블랙리스트 등록)
          await axiosInstance.post('/adoptmate/logout');
        }
      } catch (err) {
        console.warn('백엔드 로그아웃 처리 중 알림:', err);
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    localStorage.removeItem('provider');
    setIsAuthenticated(false);
    setUser(null);
  };

  // 🔔 401 세션 만료 이벤트 수신 시 자동 로그아웃 처리
  useEffect(() => {
    const handleUnauthorized = () => {
      logout(false);
      showToast('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.', 'info');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [showToast]);

  const isAdmin = !!(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN');

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
