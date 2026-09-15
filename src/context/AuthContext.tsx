import { ReactNode, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyInfo } from '../api/user';
import { AuthContextType } from '../types/auth';
import { useAuthStore } from '../stores/authStore';
import { useToast } from './ToastContext';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthBootstrap = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const setUser = useAuthStore((state) => state.setUser);
  const setUserLoading = useAuthStore((state) => state.setUserLoading);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const profileQuery = useQuery({
    queryKey: ['auth', 'profile', sessionVersion],
    queryFn: getMyInfo,
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setUserLoading(false);
      return;
    }
    setUserLoading(profileQuery.isLoading || profileQuery.isFetching);
    if (profileQuery.data) setUser(profileQuery.data);
  }, [isAuthenticated, profileQuery.data, profileQuery.isFetching, profileQuery.isLoading, setUser, setUserLoading]);

  useEffect(() => {
    const handleUnauthorized = () => {
      queryClient.removeQueries({ queryKey: ['auth'] });
      logout(false);
      showToast('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.', 'info');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, queryClient, showToast]);

  useEffect(() => {
    const clearServerState = () => queryClient.clear();
    window.addEventListener('auth:logout', clearServerState);
    return () => window.removeEventListener('auth:logout', clearServerState);
  }, [queryClient]);

  return null;
};

export const AuthProvider = ({ children }: AuthProviderProps) => (
  <>
    <AuthBootstrap />
    {children}
  </>
);

export const useAuth = (): AuthContextType => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isUserLoading = useAuthStore((state) => state.isUserLoading);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  return {
    isAuthenticated,
    isUserLoading,
    user,
    isAdmin: Boolean(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN'),
    login,
    logout,
  };
};
