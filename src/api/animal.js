import axios from './axiosInstance';

const API_BASE_URL = '/animals';

/**
 * 🔐 관리자 전용 동물 등록 API
 * @param {Object} animalData - 동물 등록 폼 데이터
 * @param {string} token - JWT 토큰
 */
export const registerAnimal = async (animalData, token) => {
  const response = await axios.post(`${API_BASE_URL}/register`, animalData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', 
    },
  });
  return response.data;
};

/**
 * 🔍 전체 동물 목록 조회 (페이징 지원)
 * @param {number} page - 페이지 번호
 * @param {number} size - 한 페이지당 항목 수
 */
export const fetchAnimalList = async (page = 0, size = 10) => {
  const response = await axios.get(`${API_BASE_URL}/list?page=${page}&size=${size}`);
  return response.data;
};

/**
 * 🐕 종별 동물 목록 조회 (GET /animals/species)
 * @param {string} species - 종 (예: 강아지, 개, 고양이 등)
 * @param {number} page - 페이지 번호
 * @param {number} size - 한 페이지당 항목 수
 */
export const fetchAnimalListBySpecies = async (species, page = 0, size = 10) => {
  const response = await axios.get(`${API_BASE_URL}/species?species=${encodeURIComponent(species)}&page=${page}&size=${size}`);
  return response.data;
};

/**
 * 🔎 ID로 단일 동물 조회
 * @param {string|number} id - 동물 ID
 */
export const fetchAnimalById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data.result || response.data;
};

/**
 * ✏️ 보호 동물 상태 수정 (관리자 전용)
 * @param {string|number} id - 동물 ID
 * @param {string} status - 상태 (WAITING, PROTECTED, ADOPTED)
 */
export const updateAnimalStatus = async (id, status) => {
  const response = await axios.put(`${API_BASE_URL}/${id}/status`, { status });
  return response.data.result || response.data;
};

/**
 * 🗑️ 보호 동물 삭제 (관리자 전용)
 * @param {string|number} id - 동물 ID
 */
export const deleteAnimal = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
  return response.data;
};
