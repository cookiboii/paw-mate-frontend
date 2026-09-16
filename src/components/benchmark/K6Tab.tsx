import React, { useState, useEffect, useTransition, useMemo } from 'react';
import {
  Activity,
  Zap,
  Gauge,
  Terminal,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  Flame,
  Copy,
  Check,
} from 'lucide-react';
import styles from '../../styles/pages/Benchmark.module.css';
import {
  runConcurrencyBenchmark,
  subscribeToWebVitals,
  type ConcurrencyTestResult,
  type WebVitalsData,
  type RequestMetric,
} from '../../utils/performance';

export default function K6Tab() {
  // ================= 5. k6 Script Snippet Copy =================
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const k6ScriptContent = `import http from 'k6/http';
import { check, sleep } from 'k6';

// 🚀 PawMate 실제 백엔드 서버 동시성 & 부하 테스트 설정
export const options = {
  stages: [
    { duration: '5s', target: 10 },   // 5초 동안 10명으로 웜업
    { duration: '15s', target: 30 },  // 15초 동안 동시 요청 30명 유지 (부하 테스트)
    { duration: '5s', target: 0 },    // 5초 동안 서서히 종료
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95%의 요청이 1초 이내 완료
    http_req_failed: ['rate<0.01'],    // 에러율 1% 미만 유지 (초고성능)
  },
};

const BASE_URL = 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

export default function () {
  // 1. No-Offset 커서 기반 고속 동물 목록 조회 (Count 쿼리 0%)
  const animalRes = http.get(\`\${BASE_URL}/api/v1/animals/cursor?size=10\`);
  check(animalRes, {
    '동물 커서 조회 HTTP 200 OK': (r) => r.status === 200,
    '동물 조회 지연시간 < 500ms': (r) => r.timings.duration < 500,
  });

  // 2. No-Offset 커서 기반 고속 게시글 목록 조회 (Count 쿼리 0%)
  const postRes = http.get(\`\${BASE_URL}/api/v1/posts/cursor?size=10\`);
  check(postRes, {
    '게시글 커서 조회 HTTP 200 OK': (r) => r.status === 200,
    '게시글 조회 지연시간 < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.3); // 가상 유저 씽킹 타임
}`;

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [isCopied]);
  const handleCopyK6 = async () => {
    try {
      await navigator.clipboard.writeText(k6ScriptContent);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Terminal size={20} /> k6 백엔드 동시성 & 부하 테스트 가이드
      </h2>
      <p className={styles.k6IntroText}>
        k6는 터미널에서 백엔드 서버로 수백~수천 개의 가상 사용자(VU) 동시 요청을 발생시켜 Race
        Condition(동시성 이슈)과 서버 한계 부하를 측정하는 최고의 도구입니다.
      </p>

      <div className={styles.k6StepSection}>
        <h3 className={styles.k6StepTitle}>1. k6 설치 (Windows)</h3>
        <div className={styles.commandBox}>winget install k6 --source winget</div>
      </div>

      <div className={styles.k6StepSection}>
        <h3 className={styles.k6StepTitle}>
          2. 동시성 부하 테스트 스크립트 (<code>k6/concurrency-test.js</code>)
        </h3>
        <div className={styles.codeBlockWrapper}>
          <button className={styles.copyBtn} onClick={handleCopyK6}>
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            {isCopied ? '복사됨' : '코드 복사'}
          </button>
          <pre>
            <code>{k6ScriptContent}</code>
          </pre>
        </div>
      </div>

      <div className={styles.k6StepSection}>
        <h3 className={styles.k6StepTitle}>3. 실시간 웹 대시보드와 함께 실행하기</h3>
        <div className={styles.commandBox}>K6_WEB_DASHBOARD=1 k6 run k6/concurrency-test.js</div>
        <p className={styles.commandHint}>
          * 실행 후 터미널에 출력되는 웹 브라우저 링크(http://localhost:5665)를 열면 실시간 부하
          차트가 표시됩니다.
        </p>
      </div>
    </div>
  );
}
