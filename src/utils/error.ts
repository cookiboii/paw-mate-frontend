import axios, { AxiosError } from 'axios';

/**
 * unknown 타입의 에러 객체로부터 사용자 친화적 에러 메시지를 안전하게 추출합니다.
 */
export function getErrorMessage(error: unknown, defaultMessage = '작업 처리 중 오류가 발생했습니다.'): string {
  if (!error) return defaultMessage;

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === 'string') {
      return data;
    }
    if (data && typeof data === 'object') {
      const maybeMessage = (data as { message?: string; statusMessage?: string }).message 
        || (data as { message?: string; statusMessage?: string }).statusMessage;
      if (maybeMessage) return maybeMessage;
    }
    if (error.message) return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
}
