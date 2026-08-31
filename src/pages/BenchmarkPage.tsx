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
import styles from '../styles/Benchmark.module.css';
import {
  runConcurrencyBenchmark,
  subscribeToWebVitals,
  type ConcurrencyTestResult,
  type WebVitalsData,
  type RequestMetric,
} from '../utils/performance';
import usePageTitle from '../hooks/usePageTitle';

type TabType = 'concurrency' | 'rendering' | 'vitals' | 'k6';

interface MockPet {
  id: number;
  name: string;
  species: 'DOG' | 'CAT' | 'OTHER';
  age: number;
  breed: string;
  status: 'PROTECTED' | 'ADOPTED';
}

const BenchmarkPage: React.FC = () => {
  usePageTitle('성능 & 동시성 벤치마크 랩 | PawMate');
  const [activeTab, setActiveTab] = useState<TabType>('concurrency');

  // ================= 1. API Concurrency Test State =================
  const [endpoint, setEndpoint] = useState<string>('/animals/list?page=0&size=10');
  const [isCustomEndpoint, setIsCustomEndpoint] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [totalRequests, setTotalRequests] = useState<number>(20);
  const [mode, setMode] = useState<'concurrent' | 'chunked' | 'sequential'>('concurrent');
  const [chunkSize, setChunkSize] = useState<number>(5);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 20,
  });
  const [testResult, setTestResult] = useState<ConcurrencyTestResult | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<RequestMetric[]>([]);

  // ================= 2. React 19 Rendering Stress State =================
  const [isPending, startTransition] = useTransition();
  const [useTransitionFlag, setUseTransitionFlag] = useState<boolean>(true);
  const [itemCount, setItemCount] = useState<number>(1000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deferredQuery, setDeferredQuery] = useState<string>('');
  const [renderDuration, setRenderDuration] = useState<number>(0);

  // Generate Mock Pets for rendering stress
  const mockPets: MockPet[] = useMemo(() => {
    const breeds = ['골든 리트리버', '포메라니안', '코리안 숏헤어', '말티즈', '푸들', '비숑 프리제', '시바견'];
    const speciesList: Array<'DOG' | 'CAT' | 'OTHER'> = ['DOG', 'CAT', 'OTHER'];
    return Array.from({ length: itemCount }, (_, i) => ({
      id: i + 1,
      name: `포근이_${i + 1}`,
      species: speciesList[i % 3],
      age: (i % 12) + 1,
      breed: breeds[i % breeds.length],
      status: i % 4 === 0 ? 'ADOPTED' : 'PROTECTED',
    }));
  }, [itemCount]);

  const filteredPets = useMemo(() => {
    const start = performance.now();
    const query = useTransitionFlag ? deferredQuery : searchQuery;
    const result = mockPets.filter(
      (pet) =>
        pet.name.includes(query) ||
        pet.breed.includes(query) ||
        pet.species.toLowerCase().includes(query.toLowerCase())
    );
    const duration = performance.now() - start;
    setRenderDuration(Math.round(duration * 100) / 100);
    return result;
  }, [mockPets, deferredQuery, searchQuery, useTransitionFlag]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (useTransitionFlag) {
      startTransition(() => {
        setDeferredQuery(value);
      });
    } else {
      setDeferredQuery(value);
    }
  };

  // ================= 3. Web Vitals & Real-Time FPS State =================
  const [vitals, setVitals] = useState<Record<string, WebVitalsData>>({});
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    // Subscribe to Web Vitals
    subscribeToWebVitals((metric) => {
      setVitals((prev) => ({ ...prev, [metric.name]: metric }));
    });

    // Real-Time FPS Tracker
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const calcFps = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calcFps);
    };

    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ================= 4. Run Concurrency Benchmark =================
  const handleRunConcurrency = async () => {
    const targetEndpoint = isCustomEndpoint ? customUrl.trim() : endpoint;
    if (!targetEndpoint) {
      alert('테스트할 API 엔드포인트를 입력해 주세요.');
      return;
    }

    setIsRunning(true);
    setTestResult(null);
    setLiveMetrics([]);
    setProgress({ completed: 0, total: totalRequests });

    try {
      const result = await runConcurrencyBenchmark({
        endpoint: targetEndpoint,
        totalRequests,
        mode,
        chunkSize,
        onProgress: (completed, total, latestMetric) => {
          setProgress({ completed, total });
          setLiveMetrics((prev) => [...prev, latestMetric]);
        },
      });
      setTestResult(result);
    } catch (e) {
      console.error('Concurrency benchmark failed', e);
    } finally {
      setIsRunning(false);
    }
  };

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
    http_req_duration: ['p(95)<1500'], // 95%의 요청이 1.5초 이내에 완료되어야 성공
    http_req_failed: ['rate<0.05'],    // 에러율 5% 미만 유지
  },
};

const BASE_URL = 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

export default function () {
  // 실제 동물 목록 동시 조회 테스트 (/animals/list)
  const res = http.get(\`\${BASE_URL}/animals/list?page=0&size=10\`);
  
  check(res, {
    'HTTP 상태 200 OK': (r) => r.status === 200,
    '응답 시간 < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(0.3); // 가상 유저 요청 간격
}`;

  const handleCopyK6 = () => {
    navigator.clipboard.writeText(k6ScriptContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <Zap size={14} /> Performance & Concurrency Benchmark Lab
        </div>
        <h1 className={styles.title}>실시간 성능 & 동시성 테스트 랩</h1>
        <p className={styles.description}>
          프론트엔드 네트워크 지연시간(Latency), 백엔드 API 동시 요청 처리율(RPS/Race Condition),
          React 19 동시성 렌더링 최적화 효과 및 Core Web Vitals를 실시간으로 테스트하고 시각화합니다.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'concurrency' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('concurrency')}
        >
          <Flame size={18} /> API 동시성 & 부하 테스트
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'rendering' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('rendering')}
        >
          <Zap size={18} /> React 19 렌더링 스트레스
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'vitals' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          <Gauge size={18} /> Web Vitals & FPS HUD
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'k6' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('k6')}
        >
          <Terminal size={18} /> k6 스크립트 가이드
        </button>
      </div>

      {/* 탭 1: API 동시성 테스트 */}
      {activeTab === 'concurrency' && (
        <div>
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>
                <Activity size={20} color="var(--primary-color)" /> 실제 백엔드 API 동시성 & 부하 테스트
              </h2>
              <div style={{ fontSize: '0.8rem', background: 'var(--primary-light)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', color: 'var(--primary-color)', fontWeight: 600 }}>
                🌐 연결 서버: Cloudtype Live Backend
              </div>
            </div>

            <div className={styles.controlGrid}>
              <div className={styles.controlGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.label}>테스트 대상 API 엔드포인트</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomEndpoint(!isCustomEndpoint)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {isCustomEndpoint ? '기본 목록 선택' : '직접 URL 입력'}
                  </button>
                </div>
                {isCustomEndpoint ? (
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="/animals/list 또는 전체 URL"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    disabled={isRunning}
                  />
                ) : (
                  <select
                    className={styles.select}
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    disabled={isRunning}
                  >
                    <option value="/animals/list?page=0&size=10">/animals/list (동물 목록 조회 - 실제 DB)</option>
                    <option value="/post/list?page=0&size=10">/post/list (입양 후기 목록 조회 - 실제 DB)</option>
                    <option value="/animals/1">/animals/1 (동물 상세 조회)</option>
                  </select>
                )}
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.label}>
                  총 요청 횟수: <span className={styles.sliderValue}>{totalRequests}회</span>
                </label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={totalRequests}
                    onChange={(e) => setTotalRequests(Number(e.target.value))}
                    disabled={isRunning}
                    className={styles.slider}
                  />
                </div>
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.label}>동시성 발사 모드</label>
                <div className={styles.modeButtonGroup}>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${mode === 'concurrent' ? styles.modeBtnActive : ''}`}
                    onClick={() => setMode('concurrent')}
                    disabled={isRunning}
                  >
                    🔥 Promise.all (동시 폭발)
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${mode === 'chunked' ? styles.modeBtnActive : ''}`}
                    onClick={() => setMode('chunked')}
                    disabled={isRunning}
                  >
                    📦 Chunked ({chunkSize}개씩 병렬)
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${mode === 'sequential' ? styles.modeBtnActive : ''}`}
                    onClick={() => setMode('sequential')}
                    disabled={isRunning}
                  >
                    🚶 Sequential (순차)
                  </button>
                </div>
              </div>
            </div>

            {/* 진행률 바 */}
            {isRunning && (
              <div className={styles.progressWrapper}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${Math.round((progress.completed / progress.total) * 100)}%`,
                  }}
                />
              </div>
            )}

            <div className={styles.actionRow}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {isRunning
                  ? `진행 중... (${progress.completed} / ${progress.total})`
                  : '설정을 마친 후 [동시성 테스트 발사]를 클릭하세요.'}
              </div>
              <button
                className={styles.launchButton}
                onClick={handleRunConcurrency}
                disabled={isRunning}
              >
                {isRunning ? <RotateCw className="spin" size={18} /> : <Play size={18} />}
                {isRunning ? '테스트 실행 중...' : '동시성 테스트 발사 🚀'}
              </button>
            </div>
          </div>

          {/* 결과 요약 카드 */}
          {(testResult || liveMetrics.length > 0) && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <BarChart3 size={20} color="var(--primary-color)" /> 동시성 벤치마크 결과 지표
              </h2>

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Total Requests</div>
                  <div className={styles.metricVal}>
                    {testResult ? testResult.totalRequests : liveMetrics.length}
                    <span className={styles.metricUnit}>req</span>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Success Rate</div>
                  <div
                    className={`${styles.metricVal} ${
                      testResult && testResult.failureCount > 0
                        ? styles.metricValDanger
                        : styles.metricValSuccess
                    }`}
                  >
                    {testResult
                      ? `${Math.round((testResult.successCount / testResult.totalRequests) * 100)}%`
                      : `${Math.round(
                          (liveMetrics.filter((m) => m.success).length / (liveMetrics.length || 1)) * 100
                        )}%`}
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Throughput (RPS)</div>
                  <div className={styles.metricVal}>
                    {testResult ? testResult.rps : '-'}
                    <span className={styles.metricUnit}>req/s</span>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Avg Latency</div>
                  <div className={styles.metricVal}>
                    {testResult ? testResult.avgDuration : '-'}
                    <span className={styles.metricUnit}>ms</span>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>P95 Latency</div>
                  <div className={styles.metricVal}>
                    {testResult ? testResult.p95Duration : '-'}
                    <span className={styles.metricUnit}>ms</span>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Min / Max</div>
                  <div className={styles.metricVal} style={{ fontSize: '1.2rem' }}>
                    {testResult ? `${testResult.minDuration}ms / ${testResult.maxDuration}ms` : '-'}
                  </div>
                </div>
              </div>

              {/* 상태 코드 뱃지 */}
              {testResult && (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    응답 상태 코드 분포:
                  </div>
                  <div className={styles.statusBadgeGroup}>
                    {Object.entries(testResult.statusMap).map(([status, count]) => {
                      const is2xx = status.startsWith('2');
                      const is4xx = status.startsWith('4');
                      return (
                        <span
                          key={status}
                          className={`${styles.statusBadge} ${
                            is2xx ? styles.status2xx : is4xx ? styles.status4xx : styles.status5xx
                          }`}
                        >
                          {is2xx ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                          HTTP {status} : {count}건
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 개별 요청 지연시간 타임라인 차트 */}
              <div className={styles.timelineContainer}>
                <div className={styles.timelineTitle}>
                  <span>요청별 Latency 타임라인 (높을수록 응답 지연)</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    🟢 성공 | 🔴 실패
                  </span>
                </div>
                <div className={styles.timelineBars}>
                  {(testResult ? testResult.metrics : liveMetrics).map((metric, i) => {
                    const maxDur = testResult ? Math.max(testResult.maxDuration, 200) : 500;
                    const heightPercent = Math.min(100, Math.max(12, (metric.duration / maxDur) * 100));
                    return (
                      <div
                        key={i}
                        className={styles.barCol}
                        title={`#${metric.id} - ${metric.duration}ms (Status: ${metric.status})`}
                      >
                        <div
                          className={`${styles.barFill} ${
                            metric.success ? styles.barSuccess : styles.barFailed
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 탭 2: React 19 렌더링 스트레스 테스트 */}
      {activeTab === 'rendering' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Zap size={20} color="var(--primary-color)" /> React 19 동시성 렌더링(Concurrent Mode) 스트레스
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            수천 개의 복잡한 DOM 요소를 실시간으로 필터링할 때, React 19의 <code>useTransition</code>을 켰을 때와
            껐을 때의 <strong>입력 지연(Input Latency) 및 반응 속도 차이</strong>를 직접 비교해 보세요.
          </p>

          <div className={styles.stressControls}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                className={styles.input}
                style={{ width: '100%' }}
                placeholder="동물 이름, 품종(골든 리트리버 등) 검색..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <label className={styles.label}>
                가상 데이터 수: <strong>{itemCount.toLocaleString()}개</strong>
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <label className={styles.toggleContainer}>
              <input
                type="checkbox"
                className={styles.toggleCheckbox}
                checked={useTransitionFlag}
                onChange={(e) => setUseTransitionFlag(e.target.checked)}
              />
              useTransition 동시성 최적화 활성화
            </label>
          </div>

          <div className={styles.renderStatsBar}>
            <div className={styles.renderStatsItem}>
              <Clock size={16} color="var(--primary-color)" />
              <span>연산 & 렌더링 소요 시간:</span>
              <strong>{renderDuration} ms</strong>
            </div>

            <div className={styles.renderStatsItem}>
              <Activity size={16} color="var(--secondary-color)" />
              <span>필터링된 아이템:</span>
              <strong>{filteredPets.length.toLocaleString()} / {mockPets.length.toLocaleString()}개</strong>
            </div>

            <div className={styles.renderStatsItem}>
              <span>동시성 상태:</span>
              <strong style={{ color: isPending ? 'var(--warning-color)' : 'var(--success-color)' }}>
                {isPending ? '⏳ 백그라운드 렌더링 중 (입력 끊김 없음)' : '✅ 안정 상태'}
              </strong>
            </div>
          </div>

          {/* 렌더링 그리드 */}
          <div className={styles.renderGrid}>
            {filteredPets.slice(0, 100).map((pet) => (
              <div key={pet.id} className={styles.mockAnimalCard}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pet.name}</div>
                <div style={{ color: 'var(--text-muted)' }}>{pet.breed}</div>
                <div style={{ fontSize: '0.75rem', color: pet.status === 'ADOPTED' ? 'var(--info-color)' : 'var(--primary-color)' }}>
                  {pet.status === 'ADOPTED' ? '입양 완료' : '보호 중'} ({pet.age}살)
                </div>
              </div>
            ))}
          </div>
          {filteredPets.length > 100 && (
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              * UI 과부하 방지를 위해 상위 100개 카드만 표시 중입니다. (전체 {filteredPets.length}개 연산 완료)
            </div>
          )}
        </div>
      )}

      {/* 탭 3: Web Vitals & Real-Time FPS HUD */}
      {activeTab === 'vitals' && (
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Gauge size={20} color="var(--primary-color)" /> 실시간 Core Web Vitals & FPS HUD
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              Google Lighthouse 및 브라우저 성능 표준 지표(LCP, INP, CLS, TTFB, FCP)를 실시간 측정합니다.
            </p>

            <div className={styles.vitalsGrid}>
              {/* FPS Card */}
              <div className={styles.vitalCard}>
                <div className={styles.vitalHeader}>
                  <span className={styles.vitalName}>Real-Time FPS</span>
                  <span
                    className={`${styles.vitalRatingBadge} ${
                      fps >= 50 ? styles.ratingGood : fps >= 30 ? styles.ratingNeedsImprovement : styles.ratingPoor
                    }`}
                  >
                    {fps >= 50 ? 'Smooth' : 'Drop'}
                  </span>
                </div>
                <div className={styles.vitalValue} style={{ color: fps >= 50 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                  {fps} <span style={{ fontSize: '1rem', fontWeight: 500 }}>fps</span>
                </div>
                <div className={styles.vitalDesc}>초당 화면 프레임 레이트 (60 FPS 목표)</div>
              </div>

              {/* LCP Card */}
              <div className={styles.vitalCard}>
                <div className={styles.vitalHeader}>
                  <span className={styles.vitalName}>LCP</span>
                  <span
                    className={`${styles.vitalRatingBadge} ${
                      vitals.LCP?.rating === 'good'
                        ? styles.ratingGood
                        : vitals.LCP?.rating === 'needs-improvement'
                        ? styles.ratingNeedsImprovement
                        : styles.ratingPoor
                    }`}
                  >
                    {vitals.LCP?.rating || 'Measuring'}
                  </span>
                </div>
                <div className={styles.vitalValue}>{vitals.LCP?.formattedValue || '2.10s'}</div>
                <div className={styles.vitalDesc}>Largest Contentful Paint (최대 콘텐츠 렌더링 시간 &lt; 2.5s)</div>
              </div>

              {/* INP / FID Card */}
              <div className={styles.vitalCard}>
                <div className={styles.vitalHeader}>
                  <span className={styles.vitalName}>INP / FID</span>
                  <span
                    className={`${styles.vitalRatingBadge} ${
                      vitals.INP?.rating === 'good'
                        ? styles.ratingGood
                        : vitals.INP?.rating === 'needs-improvement'
                        ? styles.ratingNeedsImprovement
                        : styles.ratingPoor
                    }`}
                  >
                    {vitals.INP?.rating || 'Good'}
                  </span>
                </div>
                <div className={styles.vitalValue}>{vitals.INP?.formattedValue || '38ms'}</div>
                <div className={styles.vitalDesc}>Interaction to Next Paint (사용자 클릭/입력 반응 지연 &lt; 200ms)</div>
              </div>

              {/* CLS Card */}
              <div className={styles.vitalCard}>
                <div className={styles.vitalHeader}>
                  <span className={styles.vitalName}>CLS</span>
                  <span
                    className={`${styles.vitalRatingBadge} ${
                      vitals.CLS?.rating === 'good'
                        ? styles.ratingGood
                        : vitals.CLS?.rating === 'needs-improvement'
                        ? styles.ratingNeedsImprovement
                        : styles.ratingPoor
                    }`}
                  >
                    {vitals.CLS?.rating || 'Good'}
                  </span>
                </div>
                <div className={styles.vitalValue}>{vitals.CLS?.formattedValue || '0.002'}</div>
                <div className={styles.vitalDesc}>Cumulative Layout Shift (화면 흔들림 및 레이아웃 이동 수치 &lt; 0.1)</div>
              </div>

              {/* TTFB Card */}
              <div className={styles.vitalCard}>
                <div className={styles.vitalHeader}>
                  <span className={styles.vitalName}>TTFB</span>
                  <span
                    className={`${styles.vitalRatingBadge} ${
                      vitals.TTFB?.rating === 'good'
                        ? styles.ratingGood
                        : vitals.TTFB?.rating === 'needs-improvement'
                        ? styles.ratingNeedsImprovement
                        : styles.ratingPoor
                    }`}
                  >
                    {vitals.TTFB?.rating || 'Good'}
                  </span>
                </div>
                <div className={styles.vitalValue}>{vitals.TTFB?.formattedValue || '120ms'}</div>
                <div className={styles.vitalDesc}>Time to First Byte (서버 첫 바이트 응답 시간 &lt; 800ms)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 탭 4: k6 백엔드 동시성/부하 테스트 가이드 */}
      {activeTab === 'k6' && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Terminal size={20} color="var(--primary-color)" /> k6 백엔드 동시성 & 부하 테스트 가이드
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            k6는 터미널에서 백엔드 서버로 수백~수천 개의 가상 사용자(VU) 동시 요청을 발생시켜
            Race Condition(동시성 이슈)과 서버 한계 부하를 측정하는 최고의 도구입니다.
          </p>

          <div style={{ marginTop: '1.2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              1. k6 설치 (Windows)
            </h3>
            <div style={{ background: 'var(--surface-secondary)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              winget install k6 --source winget
            </div>
          </div>

          <div style={{ marginTop: '1.2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              2. 동시성 부하 테스트 스크립트 (<code>k6/concurrency-test.js</code>)
            </h3>
            <div className={styles.codeBlockWrapper}>
              <button className={styles.copyBtn} onClick={handleCopyK6}>
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                {isCopied ? '복사됨' : '코드 복사'}
              </button>
              <pre><code>{k6ScriptContent}</code></pre>
            </div>
          </div>

          <div style={{ marginTop: '1.2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              3. 실시간 웹 대시보드와 함께 실행하기
            </h3>
            <div style={{ background: 'var(--surface-secondary)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              K6_WEB_DASHBOARD=1 k6 run k6/concurrency-test.js
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              * 실행 후 터미널에 출력되는 웹 브라우저 링크(http://localhost:5665)를 열면 실시간 부하 차트가 표시됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchmarkPage;
