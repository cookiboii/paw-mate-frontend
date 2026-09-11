import axios, { AxiosError } from 'axios';

/**
 * 🏷️ api.md 기준 백엔드 표준 비즈니스 에러 코드 (ErrorCode) 및 기본 한글 메시지
 */
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  // Common
  C001: '유효하지 않은 입력값입니다.',
  C002: '지원하지 않는 HTTP 메서드입니다.',
  C003: '서버 내부 오류가 발생했습니다.',
  C004: '본인 또는 관리자만 수정/삭제 권한이 있습니다.',
  // Member
  M001: '존재하지 않는 회원입니다.',
  M002: '이미 존재하는 이메일입니다.',
  M003: '비밀번호가 일치하지 않습니다.',
  M004: '인증 정보가 유효하지 않습니다.',
  M005: '이미 로그아웃 처리된 토큰입니다.',
  // Animal
  A001: '존재하지 않는 보호 동물입니다.',
  A002: '유효하지 않은 동물 상태입니다.',
  // Adoption
  AD001: '존재하지 않는 입양 신청입니다.',
  AD002: '이미 입양 신청한 동물입니다.',
  AD003: '보호 중인 동물만 입양 신청이 가능합니다.',
  AD004: '대기 중(PENDING)인 신청만 승인 또는 반려 처리가 가능합니다.',
  // Post & Comment
  P001: '존재하지 않는 게시글입니다.',
  CM001: '존재하지 않는 댓글입니다.',
  // Lock & Concurrency
  L001: '요청이 집중되어 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',
  L002: '다른 요청에 의해 데이터가 이미 변경되었습니다. 최신 정보를 확인 후 다시 시도해주세요.',
  // Email Verification
  E001: '인증 코드가 만료되었습니다. 다시 전송해주세요.',
  E002: '인증 코드가 일치하지 않습니다.',
  E003: '5회 이상 인증에 실패하여 차단된 상태입니다. 30분 후 다시 시도해주세요.',
  E004: '이메일 인증이 완료되지 않았습니다. 인증을 먼저 진행해주세요.',
  E005: '이메일 발송 중 오류가 발생했습니다.',
};

interface BackendErrorPayload {
  statusCode?: number;
  code?: string;
  statusMessage?: string;
  message?: string;
  error?: string;
}

/**
 * unknown 타입의 에러 객체로부터 api.md 명세에 맞춘 사용자 친화적 에러 메시지를 안전하게 추출합니다.
 */
export function getErrorMessage(error: unknown, defaultMessage = '작업 처리 중 오류가 발생했습니다.'): string {
  if (!error) return defaultMessage;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      const payload = data as BackendErrorPayload;

      // 1. 백엔드 CommonErrorDto 표준 statusMessage 최우선 추출
      if (payload.statusMessage && typeof payload.statusMessage === 'string') {
        return payload.statusMessage;
      }

      // 2. 도메인 표준 ErrorCode 매핑
      if (payload.code && ERROR_CODE_MESSAGES[payload.code]) {
        return ERROR_CODE_MESSAGES[payload.code];
      }

      // 3. message / error 필드 폴백
      if (payload.message && typeof payload.message === 'string') {
        return payload.message;
      }
      if (payload.error && typeof payload.error === 'string') {
        return payload.error;
      }
    }

    // HTTP 상태 코드별 의미 있는 기본 안내 (api.md 상태 코드 가이드 준수)
    if (status === 400) {
      return '유효하지 않은 입력값입니다. 입력 항목 및 형식을 다시 확인해 주세요.';
    }
    if (status === 401) {
      return '인증이 만료되었거나 권한이 없습니다. 다시 로그인해 주세요.';
    }
    if (status === 403) {
      return '해당 작업에 대한 권한이 없습니다.';
    }
    if (status === 404) {
      return '요청하신 리소스가 존재하지 않거나 이미 삭제되었습니다.';
    }
    if (status === 409) {
      return '다른 요청에 의해 데이터가 이미 변경되었거나 동시 수정 충돌이 발생했습니다. 최신 정보를 확인 후 다시 시도해 주세요.';
    }
    if (status === 429) {
      return '요청 횟수를 초과했습니다. 제한 시간이 지난 후 다시 시도해 주세요.';
    }
    if (status === 500) {
      return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
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
