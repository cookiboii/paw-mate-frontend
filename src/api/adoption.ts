import axiosInstance from './axiosInstance';
import { AdoptionCreateRequest, AdoptionResponseDto } from '../types/adoption';

/**
 * 🐾 입양 신청서 제출
 */
export const submitAdoption = async (animalId: number | string, payload: AdoptionCreateRequest) => {
  const response = await axiosInstance.post(`/adoptions/animals/${animalId}`, payload);
  return response.data;
};

/**
 * 📋 내 입양 신청 내역 조회
 */
export const getMyAdoptions = async (): Promise<AdoptionResponseDto[]> => {
  const response = await axiosInstance.get('/adoptions/myAdoption');
  return response.data.result || response.data || [];
};

/**
 * 👥 전체 입양 신청 목록 조회 (관리자 전용)
 */
export const getAllAdoptions = async (): Promise<AdoptionResponseDto[]> => {
  const response = await axiosInstance.get('/adoptions/all');
  return response.data.result || response.data || [];
};

/**
 * ✏️ 입양 신청 상태 변경 (관리자 전용)
 */
export const updateAdoptionStatus = async (adoptionId: number | string, status: string) => {
  const response = await axiosInstance.put(`/adoptions/${adoptionId}/status`, { adoptionStatus: status });
  return response.data;
};
