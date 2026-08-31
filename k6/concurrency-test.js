import http from 'k6/http';
import { check, sleep } from 'k6';

// 🚀 PawMate API 동시성 & 부하 테스트 스크립트
export const options = {
  stages: [
    { duration: '10s', target: 20 },  // 10초 동안 동시 사용자 20명으로 웜업
    { duration: '30s', target: 50 },  // 30초 동안 50명 동시 요청 유지 (피크 부하)
    { duration: '10s', target: 0 },   // 10초 동안 서서히 종료
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%의 요청이 500ms 이내에 완료되어야 성공
    http_req_failed: ['rate<0.01'],    // 에러율 1% 미만 유지
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

export default function () {
  // 1. 동물 목록 동시 조회
  const res = http.get(`${BASE_URL}/adoptmate/animals?page=1&limit=12`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response under 400ms': (r) => r.timings.duration < 400,
  });

  // 2. 입양 후기 동시 조회
  const reviewRes = http.get(`${BASE_URL}/adoptmate/reviews?page=1&limit=10`);
  check(reviewRes, {
    'reviews status is 200': (r) => r.status === 200,
  });

  sleep(0.5); // 가상 사용자 대기 시간 0.5초
}
