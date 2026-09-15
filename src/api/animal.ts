import axios from './axiosInstance';
import { Animal, AnimalFormData, PageResponse, SliceResponse } from '../types';
import { unwrapResult } from './apiHelper';

const API_BASE_URL = '/api/v1/animals';
const cursorPageByLastId = new Map<string, number>();

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

export const registerAnimal = async (animalData: AnimalFormData | FormData): Promise<Animal> => {
  let payload: unknown = animalData;
  if (!(animalData instanceof FormData) && typeof animalData === 'object' && animalData !== null) {
    const data = animalData as AnimalFormData;
    payload = {
      species: (data.species || 'DOG').toUpperCase(), breed: data.breed || '', color: data.color || '',
      image: data.image || '', age: Number(data.age || 0), gender: data.gender || 'MALE', status: data.status || 'PROTECTED',
    };
  }
  const response = await axios.post(API_BASE_URL, payload);
  return normalizeAnimal(unwrapResult<Animal>(response.data));
};

export const fetchAnimalList = async (page = 0, size = 10, options: { signal?: AbortSignal } = {}): Promise<PageResponse<Animal>> => {
  const response = await axios.get(API_BASE_URL, { params: { page, size }, signal: options.signal });
  const data = unwrapResult<PageResponse<Animal>>(response.data);
  return { ...data, content: Array.isArray(data.content) ? data.content.map(normalizeAnimal) : [] };
};

export const fetchAnimalCursorList = async (lastAnimalId?: number | string, size = 10): Promise<SliceResponse<Animal>> => {
  const params: Record<string, unknown> = { size };
  if (lastAnimalId !== undefined && lastAnimalId !== null && lastAnimalId !== '') params.lastAnimalId = lastAnimalId;
  const response = await axios.get(`${API_BASE_URL}/cursor`, { params });
  const data = unwrapResult<SliceResponse<Animal>>(response.data);
  const content = Array.isArray(data.content) ? data.content.map(normalizeAnimal) : [];
  return { ...data, content, hasNext: data.hasNext ?? content.length >= size, isLast: data.isLast ?? (data.hasNext !== undefined ? !data.hasNext : content.length < size) };
};

export const fetchAnimalListBySpecies = async (species: string, page = 0, size = 10, options: { signal?: AbortSignal } = {}): Promise<PageResponse<Animal>> => {
  const response = await axios.get(`${API_BASE_URL}/species`, { params: { species, page, size }, signal: options.signal });
  const data = unwrapResult<PageResponse<Animal>>(response.data);
  return { ...data, content: Array.isArray(data.content) ? data.content.map(normalizeAnimal) : [] };
};

export const fetchAnimalCursorListBySpecies = async (species: string, lastAnimalId?: number | string, size = 10): Promise<SliceResponse<Animal>> => {
  const key = `species:${species}:${size}:${String(lastAnimalId ?? '')}`;
  const page = lastAnimalId === undefined || lastAnimalId === null || lastAnimalId === '' ? 0 : cursorPageByLastId.get(key) ?? 0;
  const pageData = await fetchAnimalListBySpecies(species, page, size);
  const content = pageData.content || [];
  const lastItem = content[content.length - 1];
  if (lastItem) cursorPageByLastId.set(`species:${species}:${size}:${String(lastItem.id)}`, page + 1);
  const hasNext = pageData.last !== undefined ? !pageData.last : page + 1 < (pageData.totalPages || 1);
  return { content, hasNext, isLast: !hasNext, number: page, size, first: page === 0, last: !hasNext, empty: content.length === 0 };
};

export const fetchAllAnimals = async (species?: string): Promise<Animal[]> => {
  const pageSize = 100;
  const fetchPage = (page: number) => species && species !== 'ALL' ? fetchAnimalListBySpecies(species, page, pageSize) : fetchAnimalList(page, pageSize);
  const firstPage = await fetchPage(0);
  const remaining = await Promise.all(Array.from({ length: Math.max(0, (firstPage.totalPages || 1) - 1) }, (_, index) => fetchPage(index + 1)));
  return [firstPage, ...remaining].flatMap((page) => page.content || []);
};

export const fetchAnimalById = async (id: string | number): Promise<Animal> => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return normalizeAnimal(unwrapResult<Animal>(response.data));
};

export const updateAnimalStatus = async (id: string | number, status: string): Promise<Animal> => {
  const response = await axios.put(`${API_BASE_URL}/${id}/status`, { status });
  return normalizeAnimal(unwrapResult<Animal>(response.data));
};

export const deleteAnimal = async (id: string | number): Promise<void> => { await axios.delete(`${API_BASE_URL}/${id}`); };

export const toggleAnimalFavorite = async (id: string | number): Promise<{ animalId: number | string; isFavorite: boolean; favoriteCount: number }> => {
  const response = await axios.post(`${API_BASE_URL}/${id}/favorite`);
  return unwrapResult(response.data);
};

export const removeAnimalFavorite = async (id: string | number): Promise<{ animalId: number | string; isFavorite: boolean; favoriteCount: number }> => {
  const response = await axios.delete(`${API_BASE_URL}/${id}/favorite`);
  return unwrapResult(response.data);
};

export const fetchMyFavoriteAnimals = async (page = 0, size = 10): Promise<PageResponse<Animal>> => {
  const response = await axios.get(`${API_BASE_URL}/favorites/my`, { params: { page, size } });
  const data = unwrapResult<PageResponse<Animal>>(response.data);
  return { ...data, content: (data.content || []).map(normalizeAnimal) };
};
