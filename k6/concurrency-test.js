import http from 'k6/http';
import { check, sleep } from 'k6';

// 🚀 PawMate 실제 백엔드 서버 동시성 & 부하 테스트 스크립트
export const options = {
  stages: [
    { duration: '5s', target: 10 },   // 5초 동안 10명으로 웜업
    { duration: '15s', target: 30 },  // 15초 동안 동시 요청 30명 유지 (부하 테스트)
    { duration: '5s', target: 0 },    // 5초 동안 종료
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95%의 요청이 1.5초 이내에 완료되어야 성공
    http_req_failed: ['rate<0.05'],    // 에러율 5% 미만
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

export default function () {
  // 1. 실제 동물 목록 조회 (/animals/list)
  const animalRes = http.get(`${BASE_URL}/animals/list?page=0&size=10`);
  check(animalRes, {
    '동물 목록 HTTP 200': (r) => r.status === 200,
    '동물 목록 응답 지연 < 1000ms': (r) => r.timings.duration < 1000,
  });

  // 2. 실제 게시글/후기 목록 조회 (/post/list)
  const postRes = http.get(`${BASE_URL}/post/list?page=0&size=10`);
  check(postRes, {
    '게시글 목록 HTTP 200': (r) => r.status === 200,
  });

  sleep(0.3); // 가상 사용자 대기 0.3초
}
