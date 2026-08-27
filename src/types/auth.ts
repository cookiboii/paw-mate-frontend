export type UserRole = 'USER' | 'ADMIN' | 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id?: number | string;
  email?: string;
  name?: string;
  role?: string;
  provider?: string;
  phone?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (token: string, userInfo?: User, refreshToken?: string | null) => void;
  logout: (callApi?: boolean) => Promise<void>;
}
