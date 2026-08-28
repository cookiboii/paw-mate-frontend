import { Animal } from './animal';

// 입양 신청 상태: PENDING(심사대기), APPROVED(승인), REJECTED(반려)
export type AdoptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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

/**
 * API 명세 응답 DTO: POST /adoptions/animals/{animalId}, GET /adoptions/myAdoption,
 * GET /adoptions/all, GET /adoptions/list, PUT /adoptions/{adoptionId}/status
 */
export interface AdoptionResponseDto {
  adoptionId: number | string;
  memberName: string;
  status: AdoptionStatus | string;
  interviewer?: string;
  animalImage?: string;
  applyDate?: string;
  // 상세 정보 (서버가 추가로 반환하는 경우 대비)
  animalId?: number | string;
  animalName?: string;
  animalBreed?: string;
  phone?: string;
  housingType?: string;
  hasPet?: string;
  reason?: string;
}
