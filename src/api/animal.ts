import axios from './axiosInstance';
import { Animal, AnimalFormData, PageResponse, SliceResponse } from '../types';

const API_BASE_URL = '/animals';

/**
 * 🔐 관리자 전용 동물 등록 API
 */
export const registerAnimal = async (animalData: AnimalFormData | FormData) => {
  const response = await axios.post(`${API_BASE_URL}/register`, animalData);
  return response.data;
};

/**
 * 🔍 전체 동물 목록 조회 (오프셋 페이징)
 */
export const fetchAnimalList = async (page = 0, size = 10): Promise<PageResponse<Animal> | { result: PageResponse<Animal> }> => {
  const response = await axios.get(`${API_BASE_URL}/list?page=${page}&size=${size}`);
  return response.data;
};

/**
 * ⚡ No-Offset 커서 기반 고속 동물 목록 조회 (무한 스크롤 / Count 쿼리 0%)
 */
export const fetchAnimalCursorList = async (
  lastAnimalId?: number | string,
  size = 10
): Promise<SliceResponse<Animal> | { result: SliceResponse<Animal> }> => {
  const params = new URLSearchParams();
  if (lastAnimalId !== undefined && lastAnimalId !== null) {
    params.append('lastAnimalId', String(lastAnimalId));
  }
  params.append('size', String(size));
  const response = await axios.get(`${API_BASE_URL}/cursor?${params.toString()}`);
  return response.data;
};

/**
 * 🐕 종별 동물 목록 조회 (GET /animals/species)
 */
export const fetchAnimalListBySpecies = async (
  species: string,
  page = 0,
  size = 10
): Promise<PageResponse<Animal> | { result: PageResponse<Animal> }> => {
  const response = await axios.get(
    `${API_BASE_URL}/species?species=${encodeURIComponent(species)}&page=${page}&size=${size}`
  );
  return response.data;
};

/**
 * 🔎 ID로 단일 동물 조회
 */
export const fetchAnimalById = async (id: string | number): Promise<Animal> => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data.result || response.data;
};

/**
 * ✏️ 보호 동물 상태 수정 (관리자 전용)
 */
export const updateAnimalStatus = async (id: string | number, status: string): Promise<Animal> => {
  const response = await axios.put(`${API_BASE_URL}/${id}/status`, { status });
  return response.data.result || response.data;
};

/**
 * 🗑️ 보호 동물 삭제 (관리자 전용)
 */
export const deleteAnimal = async (id: string | number) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

