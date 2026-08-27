export type AnimalStatus = 'WAITING' | 'PROTECTED' | 'ADOPTED';
export type AnimalSpecies = 'DOG' | 'CAT' | 'ETC' | string;
export type AnimalGender = 'MALE' | 'FEMALE' | 'M' | 'F' | string;

export interface Animal {
  id: number | string;
  animalId?: number | string;
  name?: string;
  species: string;
  breed?: string;
  age?: number | string;
  gender?: string;
  color?: string;
  weight?: number | string;
  status: AnimalStatus | string;
  image?: string;
  imageUrl?: string;
  profileImageUrl?: string;
  description?: string;
  foundLocation?: string;
  shelterName?: string;
  shelterContact?: string;
  noticeStartDate?: string;
  noticeEndDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnimalCreateRequest {
  species: string;
  breed: string;
  color: string;
  image: string;
  age: number;
  gender: string;
  status: string;
}

export interface AnimalStatusUpdateRequest {
  status: AnimalStatus | string;
}

export interface AnimalFormData {
  species: string;
  breed?: string;
  age?: number | string;
  gender?: string;
  color?: string;
  weight?: number | string;
  status?: string;
  image?: string;
  description?: string;
  foundLocation?: string;
  shelterName?: string;
  shelterContact?: string;
}

export interface AnimalOptionItem {
  key: string;
  label: string;
}
