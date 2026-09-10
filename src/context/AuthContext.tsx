import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { getMyInfo } from '../api/user';
import { useToast } from './ToastContext';
import { User, AuthContextType } from '../types/auth';
import { clearAuthStorage, getAccessToken, saveAuthSession } from '../utils/authStorage';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [sessionVersion, setSessionVersion] = useState(0);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!getAccessToken();
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('paw_user_info');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch {
      // fallback to legacy keys
    }
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const provider = localStorage.getItem('provider');
    return role ? { role, email: email || undefined, name: name || undefined, provider: provider || undefined } : null;
  });

  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) {
      setIsUserLoading(false);
      return;
    }
    setIsUserLoading(true);
    getMyInfo()
      .then((profile) => {
        if (cancelled || !profile) return;
        setUser(profile);
        localStorage.setItem('paw_user_info', JSON.stringify(profile));
      })
      .catch(() => {
        // Authentication failures are handled by the response interceptor.
      })
      .finally(() => {
        if (!cancelled) setIsUserLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, sessionVersion]);

  const login = (token: string, userInfo: User = {}, refreshToken: string | null = null) => {
    const normalizedToken = saveAuthSession(token, userInfo, refreshToken);

    setIsAuthenticated(Boolean(normalizedToken));
    setIsUserLoading(true);
    setSessionVersion((version) => version + 1);
    setUser(userInfo);
  };

  const logout = async (callApi = true) => {
    if (callApi) {
      try {
        const token = getAccessToken();
        if (token) {
          // 백엔드 로그아웃 API 호출 (Redis 토큰 삭제 및 블랙리스트 등록)
          await axiosInstance.post('/adoptmate/logout');
        }
      } catch (err) {
        console.warn('백엔드 로그아웃 처리 중 알림:', err);
      }
    }

    clearAuthStorage();
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

  const isAdmin = !!(
    user?.role?.toUpperCase() === 'ADMIN' ||
    user?.role?.toUpperCase() === 'ROLE_ADMIN'
  );

  const value = useMemo(
    () => ({ isAuthenticated, isUserLoading, user, isAdmin, login, logout }),
    [isAuthenticated, isUserLoading, user, isAdmin]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
