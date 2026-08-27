import { Animal } from './animal';

export type AdoptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING' | 'APPLIED';

export interface AdoptionApplication {
  adoptionId: number | string;
  id?: number | string;
  animalId?: number | string;
  animal?: Animal;
  animalName?: string;
  animalBreed?: string;
  animalImage?: string;
  userId?: number | string;
  userName?: string;
  memberName?: string;
  interviewer?: string;
  phone?: string;
  status: AdoptionStatus | string;
  housingType?: string;
  hasPet?: boolean | string;
  reason?: string;
  interview?: string;
  applyDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdoptionCreateRequest {
  phone: string;
  housingType: string;
  hasPet: string;
  reason: string;
}

export interface AdoptionUpdateRequestDto {
  adoptionStatus: AdoptionStatus | string;
}

export interface AdoptionResponseDto {
  adoptionId: number | string;
  memberName: string;
  status: AdoptionStatus | string;
  interviewer?: string;
  animalImage?: string;
  applyDate?: string;
}
