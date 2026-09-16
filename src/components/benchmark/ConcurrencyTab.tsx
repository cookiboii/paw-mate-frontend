import type { CSSProperties } from 'react';
import { Activity, Play, RotateCw } from 'lucide-react';
import useConcurrencyBenchmark from '../../hooks/useConcurrencyBenchmark';
import styles from '../../styles/pages/Benchmark.module.css';
import ConcurrencyResults from './ConcurrencyResults';

export default function ConcurrencyTab() {
  const benchmark = useConcurrencyBenchmark();
  const {
    endpoint,
    setEndpoint,
    isCustomEndpoint,
    setIsCustomEndpoint,
    customUrl,
    setCustomUrl,
    totalRequests,
    setTotalRequests,
    mode,
    setMode,
    chunkSize,
    bypassCache,
    setBypassCache,
    isRunning,
    progress,
    testResult,
    liveMetrics,
    error,
    run,
  } = benchmark;

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h2 className={`${styles.cardTitle} ${styles.cardTitleNoMargin}`}>
            <Activity size={20} /> 실제 백엔드 API 동시성 & 부하 테스트
          </h2>
          <div className={styles.serverBadge}>🌐 연결 서버: Cloudtype Live Backend</div>
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
                onChange={(event) => setCustomUrl(event.target.value)}
                disabled={isRunning}
              />
            ) : (
              <select
                className={styles.select}
                value={endpoint}
                onChange={(event) => setEndpoint(event.target.value)}
                disabled={isRunning}
              >
                <option value="/api/v1/animals/cursor?size=10">
                  /api/v1/animals/cursor (보호 동물 No-Offset 커서 - 고성능)
                </option>
                <option value="/api/v1/posts/cursor?size=10">
                  /api/v1/posts/cursor (게시글 No-Offset 커서 - 고성능)
                </option>
                <option value="/api/v1/animals?page=0&size=10">
                  /api/v1/animals (동물 목록 조회 - 오프셋 페이징)
                </option>
                <option value="/api/v1/posts?page=0&size=10">
                  /api/v1/posts (입양 후기 목록 조회 - 오프셋 페이징)
                </option>
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
                onChange={(event) => setBypassCache(event.target.checked)}
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
                onChange={(event) => setTotalRequests(Number(event.target.value))}
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
        {isRunning && (
          <div className={styles.progressWrapper}>
            <div
              className={styles.progressBar}
              style={
                {
                  '--progress-width': `${Math.round((progress.completed / progress.total) * 100)}%`,
                } as CSSProperties
              }
            />
          </div>
        )}
        <div className={styles.actionRow}>
          <div className={styles.actionHint}>
            {isRunning
              ? `진행 중... (${progress.completed} / ${progress.total})`
              : '설정을 마친 후 [동시성 테스트 발사]를 클릭하세요.'}
          </div>
          <button className={styles.launchButton} onClick={run} disabled={isRunning}>
            {isRunning ? <RotateCw className="spin" size={18} /> : <Play size={18} />}
            {isRunning ? '테스트 실행 중...' : '동시성 테스트 발사 🚀'}
          </button>
        </div>
        {error && (
          <p className={styles.benchmarkError} role="alert">
            {error}
          </p>
        )}
      </div>
      <ConcurrencyResults result={testResult} liveMetrics={liveMetrics} />
    </div>
  );
}
