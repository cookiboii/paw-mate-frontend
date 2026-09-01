import http from 'k6/http';
import { check, sleep } from 'k6';

// 🚀 PawMate 실제 백엔드 서버 동시성 & 부하 테스트 스크립트 (No-Offset 커서 최적화 검증)
export const options = {
  stages: [
    { duration: '5s', target: 10 },   // 5초 동안 10명으로 웜업
    { duration: '15s', target: 30 },  // 15초 동안 동시 요청 30명 유지 (부하 테스트)
    { duration: '5s', target: 0 },    // 5초 동안 종료
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95%의 요청이 1초 이내 완료
    http_req_failed: ['rate<0.01'],    // 에러율 1% 미만 (초고성능)
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

export default function () {
  // ⚡ 1. No-Offset 커서 기반 동물 목록 조회 (Count 쿼리 0%)
  const animalCursorRes = http.get(`${BASE_URL}/animals/cursor?size=10`);
  check(animalCursorRes, {
    '동물 커서 목록 HTTP 200': (r) => r.status === 200,
    '동물 커서 응답 지연 < 500ms': (r) => r.timings.duration < 500,
  });

  // ⚡ 2. No-Offset 커서 기반 게시글 목록 조회 (Count 쿼리 0%)
  const postCursorRes = http.get(`${BASE_URL}/post/cursor?size=10`);
  check(postCursorRes, {
    '게시글 커서 목록 HTTP 200': (r) => r.status === 200,
    '게시글 커서 응답 지연 < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.3); // 가상 사용자 대기 0.3초
}

