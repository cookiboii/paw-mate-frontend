import axios from './axiosInstance';
import { Animal, AnimalFormData, PageResponse, SliceResponse } from '../types';
import { apiCache } from '../utils/apiCache';
import { unwrapResult } from './apiHelper';

const API_BASE_URL = '/animals';
const V1_ANIMAL_API_BASE_URL = '/api/v1/animals';

/**
 * 🐾 백엔드 응답 데이터를 프론트엔드 표준 모델로 정규화 (animalId/id, image/imageUrl 호환)
 */
export function normalizeAnimal(raw: Partial<Animal>): Animal {
  const id = raw.animalId ?? raw.id ?? '';
  return {
    ...raw,
    id,
    animalId: id,
    species: raw.species || 'DOG',
    breed: raw.breed || raw.name || '',
    name: raw.name || raw.breed || '',
    gender: raw.gender || '',
    age: raw.age !== undefined ? Number(raw.age) : 0,
    color: raw.color || '',
    status: raw.status || 'PROTECTED',
    image: raw.image || raw.imageUrl || raw.profileImageUrl || '',
    imageUrl: raw.imageUrl || raw.image || '',
    profileImageUrl: raw.profileImageUrl || raw.image || '',
  };
}

/**
 * 🔐 관리자 전용 동물 등록 API
 * Body: AnimalCreateRequest { species, breed, color, image, age, gender, status }
 */
export const registerAnimal = async (animalData: AnimalFormData | FormData): Promise<Animal> => {
  let payload: unknown = animalData;

  // FormData가 아닌 일반 객체일 경우 백엔드 AnimalCreateRequest 규격 7개 필드만 안전하게 추출
  if (!(animalData instanceof FormData) && typeof animalData === 'object' && animalData !== null) {
    const d = animalData as AnimalFormData;
    payload = {
      species: d.species,
      breed: d.breed || '',
      color: d.color || '',
      image: d.image || '',
      age: Number(d.age || 0),
      gender: d.gender || 'MALE',
      status: d.status || 'PROTECTED',
    };
  }

  const response = await axios.post(V1_ANIMAL_API_BASE_URL, payload);
  apiCache.invalidateByPrefix('animal');
  return normalizeAnimal(unwrapResult<Animal>(response.data));
};


/**
 * 🔍 전체 동물 목록 조회 (오프셋 페이징)
 */
export const fetchAnimalList = async (page = 0, size = 10): Promise<PageResponse<Animal>> => {
  const cacheKey = `animal:list:page=${page}:size=${size}`;
  return apiCache.fetchWithCache(
    cacheKey,
    async () => {
      const response = await axios.get(V1_ANIMAL_API_BASE_URL, {
        params: { page, size },
      });
      const unwrapped = unwrapResult<PageResponse<Animal>>(response.data);
      const content = Array.isArray(unwrapped.content)
        ? unwrapped.content.map(normalizeAnimal)
        : [];
      return {
        ...unwrapped,
        content,
      };
    },
    { ttl: 60 * 1000 } // 1분 캐시
  );
};

/**
 * ⚡ No-Offset 커서 기반 고속 동물 목록 조회 (무한 스크롤 / Count 쿼리 0%)
 */
export const fetchAnimalCursorList = async (
  lastAnimalId?: number | string,
  size = 10
): Promise<SliceResponse<Animal>> => {
  const params = new URLSearchParams();
  if (lastAnimalId !== undefined && lastAnimalId !== null && lastAnimalId !== '') {
    params.append('lastAnimalId', String(lastAnimalId));
  }
  params.append('size', String(size));
  const response = await axios.get(`${API_BASE_URL}/cursor?${params.toString()}`);
  const unwrapped = unwrapResult<SliceResponse<Animal>>(response.data);
  const content = Array.isArray(unwrapped.content)
    ? unwrapped.content.map(normalizeAnimal)
    : [];
  return {
    ...unwrapped,
    content,
  };
};

/**
 * 🐕 종별 동물 목록 조회 (GET /animals/species)
 */
export const fetchAnimalListBySpecies = async (
  species: string,
  page = 0,
  size = 10
): Promise<PageResponse<Animal>> => {
  const cacheKey = `animal:species:${species}:page=${page}:size=${size}`;
  return apiCache.fetchWithCache(
    cacheKey,
    async () => {
      // api.md에 종 필터의 v1 쿼리 규격은 명시되지 않아, 검증된 호환 경로를 유지한다.
      const response = await axios.get(`${API_BASE_URL}/species`, {
        params: { species, page, size },
      });
      const unwrapped = unwrapResult<PageResponse<Animal>>(response.data);
      const content = Array.isArray(unwrapped.content)
        ? unwrapped.content.map(normalizeAnimal)
        : [];
      return {
        ...unwrapped,
        content,
      };
    },
    { ttl: 60 * 1000 }
  );
};

/**
 * The API currently has no server-side text-search endpoint.  For workflows
 * that require an exact client-side match, retrieve every page before filtering
 * instead of treating the currently visible page as the complete result set.
 */
export const fetchAllAnimals = async (species?: string): Promise<Animal[]> => {
  const pageSize = 100;
  const fetchPage = (page: number) =>
    species && species !== 'ALL'
      ? fetchAnimalListBySpecies(species, page, pageSize)
      : fetchAnimalList(page, pageSize);

  const firstPage = await fetchPage(0);
  const totalPages = Math.max(1, firstPage.totalPages || 1);
  if (totalPages === 1) return firstPage.content || [];

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchPage(index + 1))
  );
  return [firstPage, ...remainingPages].flatMap((page) => page.content || []);
};

/**
 * 🔎 ID로 단일 동물 조회 (캐시 지원)
 */
export const fetchAnimalById = async (id: string | number): Promise<Animal> => {
  const cacheKey = `animal:detail:${id}`;
  return apiCache.fetchWithCache(
    cacheKey,
    async () => {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      const unwrapped = unwrapResult<Animal>(response.data);
      return normalizeAnimal(unwrapped);
    },
    { ttl: 3 * 60 * 1000 } // 3분 캐시
  );
};

/**
 * 🚀 마우스 호버 시 단일 동물 상세 미리 가져오기 (Hover Prefetch)
 */
export const prefetchAnimalById = (id: string | number): void => {
  if (!id) return;
  const cacheKey = `animal:detail:${id}`;
  apiCache.prefetch(cacheKey, async () => {
    return fetchAnimalById(id);
  });
};

/**
 * ✏️ 보호 동물 상태 수정 (관리자 전용)
 * Body: AnimalStatusUpdateRequest { status }
 */
export const updateAnimalStatus = async (id: string | number, status: string): Promise<Animal> => {
  const response = await axios.put(`${API_BASE_URL}/${id}/status`, {
    status,
  });
  apiCache.invalidateByPrefix('animal');
  return normalizeAnimal(unwrapResult<Animal>(response.data));
};


/**
 * 🗑️ 보호 동물 삭제 (관리자 전용)
 */
export const deleteAnimal = async (id: string | number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
  apiCache.invalidateByPrefix('animal');
};

/**
 * ⭐ 관심 동물 찜하기 토글 (등록 / 취소)
 * POST /animals/{id}/favorite -> FavoriteToggleResponseDto { animalId, isFavorite, favoriteCount }
 */
export const toggleAnimalFavorite = async (
  id: string | number
): Promise<{ animalId: number | string; isFavorite: boolean; favoriteCount: number }> => {
  const response = await axios.post(`${API_BASE_URL}/${id}/favorite`);
  apiCache.invalidateByPrefix('animal');
  apiCache.invalidateByPrefix('favorite');
  return unwrapResult(response.data);
};

/**
 * ❌ 관심 동물 찜 명시적 취소
 * DELETE /animals/{id}/favorite -> FavoriteToggleResponseDto
 */
export const removeAnimalFavorite = async (
  id: string | number
): Promise<{ animalId: number | string; isFavorite: boolean; favoriteCount: number }> => {
  const response = await axios.delete(`${API_BASE_URL}/${id}/favorite`);
  apiCache.invalidateByPrefix('animal');
  apiCache.invalidateByPrefix('favorite');
  return unwrapResult(response.data);
};

/**
 * 📂 내가 찜한 보호 동물 목록 조회 (최신순 페이징)
 * GET /animals/favorites/my?page=0&size=10
 */
export const fetchMyFavoriteAnimals = async (
  page = 0,
  size = 10
): Promise<PageResponse<Animal>> => {
  const response = await axios.get(`${API_BASE_URL}/favorites/my`, {
    params: { page, size },
  });

  const pageData = unwrapResult<PageResponse<Animal>>(response.data);
  return {
    ...pageData,
    content: (pageData.content || []).map(normalizeAnimal),
  };
};
