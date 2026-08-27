export type UserRole = 'USER' | 'ADMIN' | 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id?: number | string;
  email?: string;
  name?: string;
  role?: string;
  profileImage?: string;
  socialProvider?: string;
  socialId?: string;
  provider?: string;
  phone?: string;
  createdAt?: string;
}

export type MemberInfoResponseDto = User;

export interface MemberRegisterRequestDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole | string;
}

export interface MemberLoginRequestDto {
  email: string;
  password: string;
}

export interface MemberLoginResultDto {
  token: string;
  refreshToken?: string;
  email: string;
  role: UserRole | string;
}

export interface PasswordChangeRequestDto {
  currentPassword?: string;
  newPassword?: string;
}

export interface PasswordResetRequestDto {
  email: string;
  password: string;
}

export type LoginCredentials = MemberLoginRequestDto;
export type RegisterPayload = MemberRegisterRequestDto;

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (token: string, userInfo?: User, refreshToken?: string | null) => void;
  logout: (callApi?: boolean) => Promise<void>;
}
