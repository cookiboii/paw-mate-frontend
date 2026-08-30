/**
 * 전화번호 문자열에서 숫자만 추출하여 한국 표준 전화번호 형식으로 자동 하이픈을 추가합니다.
 * - 휴대폰 (010, 011 등): 010-1234-5678 (10~11자리)
 * - 서울 지역번호 (02): 02-123-4567 또는 02-1234-5678 (9~10자리)
 * - 일반 지역번호 (031, 051 등): 031-123-4567 또는 031-1234-5678 (10~11자리)
 */
export function formatPhoneNumber(value: string): string {
  if (!value) return '';

  // 숫자 이외의 문자 제거
  const digits = value.replace(/\D/g, '').slice(0, 11);

  // 서울 지역번호 (02)
  if (digits.startsWith('02')) {
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 5) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    if (digits.length <= 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  // 휴대폰 및 기타 지역번호 (010, 031 등)
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/**
 * 올바른 휴대폰 번호 형식(010-XXXX-XXXX 등)인지 검증합니다.
 */
export function isValidPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return /^(01[016789]|02|0[3-9][0-9])\d{3,4}\d{4}$/.test(digits);
}
