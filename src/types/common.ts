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

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  result?: T;
  data?: T;
  code?: number;
}
