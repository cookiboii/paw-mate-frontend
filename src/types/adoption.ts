import { Animal } from './animal';

// 입양 신청 상태: PENDING(심사대기), APPROVED(승인), REJECTED(반려)
export type AdoptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// 주거 형태: APARTMENT, DETACHED_HOUSE, VILLA, ONE_ROOM, ETC (api.md 기준)
export type HousingType = 'APARTMENT' | 'DETACHED_HOUSE' | 'VILLA' | 'ONE_ROOM' | 'ETC' | (string & {});

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
  housingType?: HousingType | string;
  hasPet?: boolean | string;
  reason?: string;
  interview?: string;
  applyDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdoptionCreateRequest {
  phone: string;
  housingType: HousingType | string;
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
  animalId?: number | string;
  animalBreed?: string;
  animalImage?: string;
  userName?: string;
  memberName?: string;
  phone?: string;
  housingType?: string;
  hasPet?: string;
  reason?: string;
  status: AdoptionStatus | string;
  applyDate?: string;
  // 레거시/확장 호환 필드
  animalName?: string;
  interviewer?: string;
  interview?: string;
}

export type AdoptionHistoryItem = AdoptionResponseDto;
