import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/animals'; // ✅ 백엔드 주소 (Controller prefix 기준)

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
 * 🔎 ID로 단일 동물 조회
 * @param {string|number} id - 동물 ID
 */
export const fetchAnimalById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data.result; // ✅ CommonResDto 구조에 맞게 result만 반환
};
