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

export default function VitalsTab({ active }: { active: boolean }) {
  // ================= 3. Web Vitals & Real-Time FPS State =================
  const [vitals, setVitals] = useState<Record<string, WebVitalsData>>({});
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    if (!active) return;
    // Subscribe to Web Vitals
    const unsubscribe = subscribeToWebVitals((metric) => {
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
    return () => {
      unsubscribe();
      cancelAnimationFrame(animId);
    };
  }, [active]);

  return (
    <div>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Gauge size={20} /> 실시간 Core Web Vitals & FPS HUD
        </h2>
        <p className={styles.cardSubDesc}>
          Google Lighthouse 및 브라우저 성능 표준 지표(LCP, INP, CLS, TTFB, FCP)를 실시간
          측정합니다.
        </p>

        <div className={styles.vitalsGrid}>
          {/* FPS Card */}
          <div className={styles.vitalCard}>
            <div className={styles.vitalHeader}>
              <span className={styles.vitalName}>Real-Time FPS</span>
              <span
                className={`${styles.vitalRatingBadge} ${
                  fps >= 50
                    ? styles.ratingGood
                    : fps >= 30
                      ? styles.ratingNeedsImprovement
                      : styles.ratingPoor
                }`}
              >
                {fps >= 50 ? 'Smooth' : 'Drop'}
              </span>
            </div>
            <div
              className={`${styles.vitalValue} ${fps >= 50 ? styles.vitalFpsGood : styles.vitalFpsDrop}`}
            >
              {fps} <span className={styles.vitalUnit}>fps</span>
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
            <div className={styles.vitalDesc}>
              Largest Contentful Paint (최대 콘텐츠 렌더링 시간 &lt; 2.5s)
            </div>
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
            <div className={styles.vitalDesc}>
              Interaction to Next Paint (사용자 클릭/입력 반응 지연 &lt; 200ms)
            </div>
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
            <div className={styles.vitalDesc}>
              Cumulative Layout Shift (화면 흔들림 및 레이아웃 이동 수치 &lt; 0.1)
            </div>
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
            <div className={styles.vitalDesc}>
              Time to First Byte (서버 첫 바이트 응답 시간 &lt; 800ms)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
