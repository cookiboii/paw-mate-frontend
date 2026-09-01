export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export type ThemeType = 'light' | 'dark';

export interface PageResponse<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
  last?: boolean;
  first?: boolean;
  empty?: boolean;
}

/**
 * ⚡ Spring Data Slice 기반 No-Offset 커서 페이징 응답 (Count 쿼리 0%)
 */
export interface SliceResponse<T> {
  content: T[];
  hasNext?: boolean;
  isLast?: boolean;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface ApiResponse<T = unknown> {
  isSuccess?: boolean;
  success?: boolean;
  message?: string;
  result?: T;
  data?: T;
  code?: number | string;
}

export interface CommonErrorDto {
  statusCode: number;
  code: string;
  statusMessage: string;
}

