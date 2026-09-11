import axiosInstance from './axiosInstance';
import { LoginCredentials, RegisterPayload } from '../types/auth';

/**
 * 📝 회원가입 API (POST /adoptmate/register)
 * Body: { name, email, password, role }
 */
export const registerUser = async ({ name, email, password, role = 'USER' }: RegisterPayload) => {
  return await axiosInstance.post('/adoptmate/register', {
    name,
    email,
    password,
    role,
  });
};

/**
 * 🔑 로그인 API (POST /adoptmate/login)
 * Body: { email, password }
 */
export const loginUser = async ({ email, password }: LoginCredentials) => {
  return await axiosInstance.post('/adoptmate/login', {
    email,
    password,
  });
};

/**
 * 🚪 로그아웃 API (POST /adoptmate/logout)
 * Bearer 토큰을 Redis 블랙리스트에 등록
 */
export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post('/adoptmate/logout');
};

/**
 * 🔄 Access Token 재발급 API
 */
export const refreshAccessToken = async (refreshToken: string) => {
  return await axiosInstance.post('/adoptmate/refresh-token', { refreshToken });
};

/**
 * ✉️ 회원가입용 이메일 인증 코드 발송 (POST /adoptmate/verify-email)
 */
export const verifyEmail = async (email: string) => {
  return await axiosInstance.post('/adoptmate/verify-email', { email });
};

/**
 * ✉️ 회원가입용 이메일 인증 코드 검증 (POST /adoptmate/verify-code)
 */
export const verifyCode = async (email: string, code: string) => {
  return await axiosInstance.post('/adoptmate/verify-code', { email, code });
};

/**
 * 🔑 비밀번호 재설정 인증 코드 이메일 발송 (POST /adoptmate/send-reset-code?email=...)
 */
export const sendResetCode = async (email: string) => {
  return await axiosInstance.post('/adoptmate/send-reset-code', null, {
    params: { email },
  });
};

/**
 * 🔑 비밀번호 재설정 인증 코드 검증 (POST /adoptmate/verify-reset-code?email=...&code=...)
 */
export const verifyResetCode = async (email: string, code: string) => {
  return await axiosInstance.post('/adoptmate/verify-reset-code', null, {
    params: { email, code },
  });
};

/**
 * 🔒 비밀번호 재설정 실행 (PATCH /adoptmate/password)
 * Body: PasswordResetRequestDto { email: string, password: string }
 */
export const resetPassword = async (email: string, newPassword: string) => {
  return await axiosInstance.patch('/adoptmate/password', {
    email,
    password: newPassword,
  });
};
