import { AnimalOptionItem } from '../types/animal';

/**
 * 🐾 동물 관련 공통 상수 및 헬퍼 함수
 */

export const AnimalStatus = {
  WAITING: 'WAITING',
  PROTECTED: 'PROTECTED',
  ADOPTED: 'ADOPTED',
} as const;

export type AnimalStatusKey = (typeof AnimalStatus)[keyof typeof AnimalStatus];

export const SPECIES_OPTIONS: AnimalOptionItem[] = [
  { key: 'DOG', label: '강아지 (Dog)' },
  { key: 'CAT', label: '고양이 (Cat)' },
  { key: 'ETC', label: '기타 (ETC)' },
];

export const STATUS_OPTIONS: AnimalOptionItem[] = [
  { key: 'WAITING', label: '입양 대기' },
  { key: 'PROTECTED', label: '임시 보호 중' },
  { key: 'ADOPTED', label: '입양 완료' },
];

export const GENDER_OPTIONS: AnimalOptionItem[] = [
  { key: 'MALE', label: '수컷' },
  { key: 'FEMALE', label: '암컷' },
];

/**
 * 성별 텍스트 변환
 */
export const getGenderLabel = (gender?: string | null): string => {
  if (!gender) return '정보 없음';
  const g = gender.toUpperCase();
  if (g === 'M' || g === 'MALE') return '수컷';
  if (g === 'F' || g === 'FEMALE') return '암컷';
  return gender;
};

/**
 * 상태 텍스트 변환
 */
export const getStatusLabel = (status?: string | null): string => {
  const mapping: Record<string, string> = {
    WAITING: '입양 대기',
    PROTECTED: '임시 보호 중',
    ADOPTED: '입양 완료',
  };
  return (status && mapping[status]) || status || '상태 미정';
};

/**
 * 종(Species) 텍스트 변환
 */
export const getSpeciesLabel = (species?: string | null): string => {
  const mapping: Record<string, string> = {
    DOG: '강아지',
    CAT: '고양이',
    ETC: '기타',
  };
  return (species && mapping[species.toUpperCase()]) || species || '기타';
};
