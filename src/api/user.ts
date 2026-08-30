import axiosInstance from './axiosInstance';
import { User } from '../types/auth';

/**
 * 👤 내 회원 정보 조회
 */
export const getMyInfo = async (): Promise<User> => {
  const response = await axiosInstance.get('/adoptmate/myInfo');
  return response.data.result || response.data;
};

/**
 * 👥 전체 회원 목록 조회 (관리자 전용)
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get('/adoptmate/all');
  return response.data.result || response.data || [];
};

/**
 * 🗑️ 회원 탈퇴
 */
export const deleteMyAccount = async () => {
  return await axiosInstance.delete('/adoptmate/delete');
};

/**
 * 🔒 비밀번호 변경
 */
export const updatePassword = async (payload: {
  currentPassword?: string;
  newPassword?: string;
  passwd?: string;
  new_passwd?: string;
}) => {
  return await axiosInstance.post('/adoptmate/password', payload);
};
