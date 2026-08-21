/**
 * 📅 날짜 포맷 유틸리티
 */

/**
 * 날짜를 한국어 형식(YYYY년 M월 D일 또는 YYYY. MM. DD.)으로 변환
 * @param {string|Date} dateValue 
 * @param {Intl.DateTimeFormatOptions} options 
 */
export const formatDate = (dateValue, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
  if (!dateValue) return '-';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('ko-KR', options);
  } catch {
    return '-';
  }
};

/**
 * 날짜와 시간을 한국어 형식으로 변환
 * @param {string|Date} dateValue 
 */
export const formatDateTime = (dateValue) => {
  if (!dateValue) return '-';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};
