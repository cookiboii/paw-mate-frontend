import { create } from 'zustand';
import { logoutUser } from '../api/auth';
import { User } from '../types/auth';
import { clearAuthStorage, getAccessToken, saveAuthSession } from '../utils/authStorage';

interface AuthState {
  isAuthenticated: boolean;
  isUserLoading: boolean;
  user: User | null;
  sessionVersion: number;
  setUser: (user: User | null) => void;
  setUserLoading: (isUserLoading: boolean) => void;
  login: (token: string, userInfo?: User, refreshToken?: string | null) => void;
  logout: (callApi?: boolean) => Promise<void>;
}

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('paw_user_info');
    if (stored) return JSON.parse(stored) as User;
  } catch {
    // Fall back to legacy storage keys below.
  }
  const role = localStorage.getItem('role');
  if (!role) return null;
  return {
    role,
    email: localStorage.getItem('email') || undefined,
    name: localStorage.getItem('name') || undefined,
    provider: localStorage.getItem('provider') || undefined,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: Boolean(getAccessToken()),
  isUserLoading: Boolean(getAccessToken()),
  user: getStoredUser(),
  sessionVersion: 0,
  setUser: (user) => {
    if (user) localStorage.setItem('paw_user_info', JSON.stringify(user));
    set({ user });
  },
  setUserLoading: (isUserLoading) => set({ isUserLoading }),
  login: (token, userInfo = {}, refreshToken = null) => {
    const normalizedToken = saveAuthSession(token, userInfo, refreshToken);
    set((state) => ({
      isAuthenticated: Boolean(normalizedToken),
      isUserLoading: true,
      user: userInfo,
      sessionVersion: state.sessionVersion + 1,
    }));
  },
  logout: async (callApi = true) => {
    if (callApi && getAccessToken()) {
      try {
        await logoutUser();
      } catch {
        /* Local logout must still succeed. */
      }
    }
    clearAuthStorage();
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('auth:logout'));
    set((state) => ({
      isAuthenticated: false,
      isUserLoading: false,
      user: null,
      sessionVersion: state.sessionVersion + 1,
    }));
  },
}));
