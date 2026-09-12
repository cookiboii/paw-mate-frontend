// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { clearAuthStorage, getAccessToken, getRefreshToken, saveAuthSession, updateAuthTokens } from './authStorage';

describe('authStorage', () => {
  beforeEach(() => localStorage.clear());

  it('normalizes and stores one session', () => {
    localStorage.setItem('role', 'ADMIN');
    saveAuthSession('Bearer access-token', { email: 'user@example.com', role: 'USER' }, 'refresh-token');
    expect(getAccessToken()).toBe('access-token');
    expect(getRefreshToken()).toBe('refresh-token');
    expect(JSON.parse(localStorage.getItem('paw_user_info') || '{}').email).toBe('user@example.com');
    expect(localStorage.getItem('role')).toBe('USER');
  });

  it('clears current and legacy authentication keys', () => {
    localStorage.setItem('accessToken', 'legacy');
    localStorage.setItem('refresh_token', 'legacy-refresh');
    localStorage.setItem('paw_user_info', '{}');
    clearAuthStorage();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem('paw_user_info')).toBeNull();
  });

  it('updates tokens properly for rotation', () => {
    localStorage.setItem('token', 'old-access');
    localStorage.setItem('refreshToken', 'old-refresh');
    updateAuthTokens('Bearer new-access', 'new-refresh');
    expect(getAccessToken()).toBe('new-access');
    expect(getRefreshToken()).toBe('new-refresh');
  });
});
