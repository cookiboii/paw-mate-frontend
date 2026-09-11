import axiosInstance from './axiosInstance';
import { AdoptionCreateRequest, AdoptionResponseDto } from '../types/adoption';
import { PageResponse } from '../types/common';
import { unwrapResult } from './apiHelper';

/**
 * 🐾 입양 신청서 제출
 */
export const submitAdoption = async (
  animalId: number | string,
  payload: AdoptionCreateRequest
): Promise<AdoptionResponseDto> => {
  const response = await axiosInstance.post(`/adoptions/animals/${animalId}`, payload);
  return unwrapResult<AdoptionResponseDto>(response.data);
};

/**
 * 📋 내 입양 신청 내역 조회
 */
export const getMyAdoptions = async (): Promise<AdoptionResponseDto[]> => {
  const response = await axiosInstance.get('/adoptions/myAdoption');
  return unwrapResult<AdoptionResponseDto[]>(response.data) || [];
};

/**
 * 👥 전체 입양 신청 목록 조회 (관리자 전용 - 리스트)
 */
export const getAllAdoptions = async (): Promise<AdoptionResponseDto[]> => {
  const response = await axiosInstance.get('/adoptions/all');
  return unwrapResult<AdoptionResponseDto[]>(response.data) || [];
};

/**
 * 👥 전체 입양 신청 목록 조회 (관리자 전용 - 페이징)
 */
export const getAdoptionsPaged = async (
  page = 0,
  size = 10,
  sort = 'id,desc'
): Promise<PageResponse<AdoptionResponseDto>> => {
  const response = await axiosInstance.get('/adoptions/list', {
    params: { page, size, sort },
  });
  return unwrapResult<PageResponse<AdoptionResponseDto>>(response.data);
};

/**
 * ✏️ 입양 신청 상태 변경 (관리자 전용)
 * Body: AdoptionUpdateRequestDto { adoptionStatus: AdoptionStatus }
 */
export const updateAdoptionStatus = async (
  adoptionId: number | string,
  status: string
): Promise<AdoptionResponseDto> => {
  const response = await axiosInstance.put(`/adoptions/${adoptionId}/status`, {
    adoptionStatus: status,
  });
  return unwrapResult<AdoptionResponseDto>(response.data);
};
