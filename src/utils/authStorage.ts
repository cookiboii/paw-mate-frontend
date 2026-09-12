import { User } from '../types/auth';

const AUTH_KEYS = [
  'token',
  'accessToken',
  'refreshToken',
  'refresh_token',
  'paw_user_info',
  'role',
  'email',
  'name',
  'provider',
] as const;

export const getAccessToken = (): string | null =>
  localStorage.getItem('token') || localStorage.getItem('accessToken');

export const getRefreshToken = (): string | null =>
  localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');

export const saveAuthSession = (token: string, user: User = {}, refreshToken?: string | null) => {
  const normalizedToken = token.replace(/^Bearer\s+/i, '').trim();
  clearAuthStorage();
  localStorage.setItem('token', normalizedToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

  localStorage.setItem('paw_user_info', JSON.stringify(user));
  if (user.role) localStorage.setItem('role', user.role);
  if (user.email) localStorage.setItem('email', user.email);
  if (user.name) localStorage.setItem('name', user.name);
  if (user.provider) localStorage.setItem('provider', user.provider);
  return normalizedToken;
};

export const updateAuthTokens = (token: string, refreshToken?: string | null) => {
  const normalizedToken = token.replace(/^Bearer\s+/i, '').trim();
  localStorage.setItem('token', normalizedToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  return normalizedToken;
};

export const clearAuthStorage = () => {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};
