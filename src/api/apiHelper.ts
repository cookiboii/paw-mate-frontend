import { ApiResponse } from '../types/common';

/**
 * 백엔드 응답(data 또는 data.result)에서 실 데이터를 일관되게 언래핑합니다.
 */
export function unwrapResult<T>(responseData: unknown): T {
  if (responseData && typeof responseData === 'object') {
    const apiRes = responseData as ApiResponse<T>;
    if ('result' in apiRes) {
      return apiRes.result as T;
    }
    if (apiRes.data !== undefined && apiRes.data !== null) {
      return apiRes.data;
    }
  }
  return responseData as T;
}
