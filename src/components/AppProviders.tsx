import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import ErrorBoundary from './ErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * 📦 최상위 전역 Context Provider들을 합성하여 Provider Hell을 해소하는 래퍼 컴포넌트
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <FavoritesProvider>{children}</FavoritesProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
