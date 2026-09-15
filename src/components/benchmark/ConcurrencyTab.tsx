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


export default function ConcurrencyTab() {
  // ================= 1. API Concurrency Test State =================
  const [endpoint, setEndpoint] = useState<string>('/api/v1/animals/cursor?size=10');
  const [isCustomEndpoint, setIsCustomEndpoint] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [totalRequests, setTotalRequests] = useState<number>(20);
  const [mode, setMode] = useState<'concurrent' | 'chunked' | 'sequential'>('concurrent');
  const [chunkSize, setChunkSize] = useState<number>(5);
  const [bypassCache, setBypassCache] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 20,
  });
  const [testResult, setTestResult] = useState<ConcurrencyTestResult | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<RequestMetric[]>([]);

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
        bypassCache,
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


  return (
    <div>
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h2 className={`${styles.cardTitle} ${styles.cardTitleNoMargin}`}>
            <Activity size={20} /> 실제 백엔드 API 동시성 & 부하 테스트
          </h2>
          <div className={styles.serverBadge}>
            🌐 연결 서버: Cloudtype Live Backend
          </div>
        </div>

        <div className={styles.controlGrid}>
          <div className={styles.controlGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>테스트 대상 API 엔드포인트</label>
              <button
                type="button"
                onClick={() => setIsCustomEndpoint(!isCustomEndpoint)}
                className={styles.textToggleBtn}
              >
                {isCustomEndpoint ? '기본 목록 선택' : '직접 URL 입력'}
              </button>
            </div>
            {isCustomEndpoint ? (
              <input
                type="text"
                className={styles.input}
                placeholder="/api/v1/animals 또는 전체 URL"
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
                <option value="/api/v1/animals/cursor?size=10">/api/v1/animals/cursor (보호 동물 No-Offset 커서 - 고성능)</option>
                <option value="/api/v1/posts/cursor?size=10">/api/v1/posts/cursor (게시글 No-Offset 커서 - 고성능)</option>
                <option value="/api/v1/animals?page=0&size=10">/api/v1/animals (동물 목록 조회 - 오프셋 페이징)</option>
                <option value="/api/v1/posts?page=0&size=10">/api/v1/posts (입양 후기 목록 조회 - 오프셋 페이징)</option>
                <option value="/api/v1/animals/1">/api/v1/animals/1 (동물 상세 조회)</option>
              </select>
            )}
          </div>

          <div className={styles.controlGroup}>
            <label className={`${styles.label} ${styles.checkboxLabel}`}>
              <span>타임스탬프 캐시 무효화 (_t 강제 파라미터)</span>
              <input
                type="checkbox"
                checked={bypassCache}
                onChange={(e) => setBypassCache(e.target.checked)}
                disabled={isRunning}
                className={styles.checkboxInput}
              />
            </label>
            <p className={styles.controlHint}>
              {bypassCache
                ? '매 요청마다 고유 파라미터를 붙여 브라우저/서버 캐시를 무효화합니다 (DB 직격 부하).'
                : '표준 REST 요청으로 실제 운영 환경과 동일하게 측정합니다.'}
            </p>
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
                '--progress-width': `${Math.round((progress.completed / progress.total) * 100)}%`,
              } as React.CSSProperties}
            />
          </div>
        )}

        <div className={styles.actionRow}>
          <div className={styles.actionHint}>
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
            <BarChart3 size={20} /> 동시성 벤치마크 결과 지표
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
              <div className={`${styles.metricVal} ${styles.metricValSmall}`}>
                {testResult ? `${testResult.minDuration}ms / ${testResult.maxDuration}ms` : '-'}
              </div>
            </div>
          </div>

          {/* 상태 코드 뱃지 */}
          {testResult && (
            <div>
              <div className={styles.statusLabel}>
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
              <span className={styles.timelineLegend}>
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
                      style={{ '--bar-height': `${heightPercent}%` } as React.CSSProperties}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
