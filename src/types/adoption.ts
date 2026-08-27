import { Animal } from './animal';

export type AdoptionStatus = 'APPLIED' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface AdoptionApplication {
  id: number | string;
  animalId: number | string;
  animal?: Animal;
  userId?: number | string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  status: AdoptionStatus | string;
  address?: string;
  reason?: string;
  housingType?: string;
  hasPet?: boolean | string;
  familyAgreement?: boolean | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdoptionApplicationPayload {
  applicantName: string;
  applicantPhone: string;
  address: string;
  reason: string;
  housingType?: string;
  hasPet?: boolean | string;
  familyAgreement?: boolean | string;
}
