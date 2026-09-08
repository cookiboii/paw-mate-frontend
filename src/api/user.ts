import axiosInstance from './axiosInstance';
import { User } from '../types/auth';
import { unwrapResult } from './apiHelper';

/**
 * 👤 내 회원 정보 조회
 */
export const getMyInfo = async (): Promise<User> => {
  const response = await axiosInstance.get('/adoptmate/myInfo');
  return unwrapResult<User>(response.data);
};

/**
 * 👥 전체 회원 목록 조회 (관리자 전용)
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get('/adoptmate/all');
  return unwrapResult<User[]>(response.data) || [];
};

/**
 * 🗑️ 회원 탈퇴
 */
export const deleteMyAccount = async (): Promise<void> => {
  await axiosInstance.delete('/adoptmate/delete');
};

/**
 * 🔒 비밀번호 변경
 * Body: PasswordChangeRequestDto { currentPassword: string, newPassword: string }
 */
export const updatePassword = async (payload: {
  currentPassword?: string;
  newPassword?: string;
  passwd?: string;
  new_passwd?: string;
}): Promise<void> => {
  const currentPassword = payload.currentPassword || payload.passwd || '';
  const newPassword = payload.newPassword || payload.new_passwd || '';

  await axiosInstance.post('/adoptmate/password', {
    currentPassword,
    newPassword,
  });
};

