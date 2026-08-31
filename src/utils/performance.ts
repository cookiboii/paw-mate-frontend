import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import axiosInstance from '../api/axiosInstance';

export interface WebVitalsData {
  name: 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  formattedValue: string;
}

export interface RequestMetric {
  id: number;
  status: number | 'ERR';
  duration: number; // ms
  success: boolean;
  timestamp: number;
  errorMessage?: string;
}

export interface ConcurrencyTestResult {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  totalTimeMs: number;
  rps: number;
  minDuration: number;
  maxDuration: number;
  avgDuration: number;
  p95Duration: number;
  statusMap: Record<string, number>;
  metrics: RequestMetric[];
}

// 📌 1. Web Vitals 옵저버 등록
export const subscribeToWebVitals = (onUpdate: (metric: WebVitalsData) => void) => {
  const formatMetric = (metric: Metric): WebVitalsData => {
    let formatted = `${Math.round(metric.value)}ms`;
    if (metric.name === 'CLS') {
      formatted = metric.value.toFixed(3);
    } else if (metric.value > 1000) {
      formatted = `${(metric.value / 1000).toFixed(2)}s`;
    }
    return {
      name: metric.name as WebVitalsData['name'],
      value: metric.value,
      rating: metric.rating,
      formattedValue: formatted,
    };
  };

  try {
    onCLS((m) => onUpdate(formatMetric(m)));
    onFCP((m) => onUpdate(formatMetric(m)));
    onINP((m) => onUpdate(formatMetric(m)));
    onLCP((m) => onUpdate(formatMetric(m)));
    onTTFB((m) => onUpdate(formatMetric(m)));
  } catch (e) {
    console.warn('Web Vitals observer not fully supported in this browser', e);
  }
};

// 📌 2. API 동시성 부하 테스트 엔진 (Promise.all vs Chunked vs Sequential)
export const runConcurrencyBenchmark = async ({
  endpoint,
  totalRequests = 20,
  mode = 'concurrent', // 'concurrent' (Promise.all) | 'chunked' (배치 동시) | 'sequential' (순차)
  chunkSize = 5,
  onProgress,
}: {
  endpoint: string;
  totalRequests: number;
  mode: 'concurrent' | 'chunked' | 'sequential';
  chunkSize?: number;
  onProgress?: (completed: number, total: number, latestMetric: RequestMetric) => void;
}): Promise<ConcurrencyTestResult> => {
  const metrics: RequestMetric[] = [];
  const statusMap: Record<string, number> = {};
  const startTime = performance.now();

  const executeSingleRequest = async (id: number): Promise<RequestMetric> => {
    const reqStart = performance.now();
    try {
      const res = await axiosInstance.get(endpoint, {
        // 캐시 방지를 위한 타임스탬프 쿼리
        params: { _t: Date.now() + id },
      });
      const duration = performance.now() - reqStart;
      const metric: RequestMetric = {
        id,
        status: res.status,
        duration: Math.round(duration),
        success: res.status >= 200 && res.status < 300,
        timestamp: Date.now(),
      };
      statusMap[res.status] = (statusMap[res.status] || 0) + 1;
      return metric;
    } catch (err: unknown) {
      const duration = performance.now() - reqStart;
      const axiosErr = err as { response?: { status?: number }; message?: string };
      const status = axiosErr.response?.status || 'ERR';
      const metric: RequestMetric = {
        id,
        status,
        duration: Math.round(duration),
        success: false,
        timestamp: Date.now(),
        errorMessage: axiosErr.message || 'Request failed',
      };
      statusMap[String(status)] = (statusMap[String(status)] || 0) + 1;
      return metric;
    }
  };

  if (mode === 'concurrent') {
    // 🔥 동시 폭발 (Promise.all)
    let completedCount = 0;
    const promises = Array.from({ length: totalRequests }, (_, idx) =>
      executeSingleRequest(idx + 1).then((metric) => {
        metrics.push(metric);
        completedCount++;
        onProgress?.(completedCount, totalRequests, metric);
        return metric;
      })
    );
    await Promise.all(promises);
  } else if (mode === 'sequential') {
    // 🚶 순차 실행
    for (let i = 0; i < totalRequests; i++) {
      const metric = await executeSingleRequest(i + 1);
      metrics.push(metric);
      onProgress?.(i + 1, totalRequests, metric);
    }
  } else {
    // 📦 배치(청크) 실행
    let completedCount = 0;
    for (let i = 0; i < totalRequests; i += chunkSize) {
      const chunk = Array.from(
        { length: Math.min(chunkSize, totalRequests - i) },
        (_, idx) => i + idx + 1
      );
      const chunkPromises = chunk.map((id) =>
        executeSingleRequest(id).then((metric) => {
          metrics.push(metric);
          completedCount++;
          onProgress?.(completedCount, totalRequests, metric);
          return metric;
        })
      );
      await Promise.all(chunkPromises);
    }
  }

  const totalTimeMs = performance.now() - startTime;
  const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
  const successCount = metrics.filter((m) => m.success).length;
  const failureCount = totalRequests - successCount;
  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((acc, cur) => acc + cur, 0) / durations.length)
      : 0;
  const minDuration = durations[0] || 0;
  const maxDuration = durations[durations.length - 1] || 0;
  const p95Index = Math.floor(durations.length * 0.95);
  const p95Duration = durations[p95Index] || maxDuration;
  const rps = parseFloat(((totalRequests / (totalTimeMs / 1000)) || 0).toFixed(2));

  return {
    totalRequests,
    successCount,
    failureCount,
    totalTimeMs: Math.round(totalTimeMs),
    rps,
    minDuration,
    maxDuration,
    avgDuration,
    p95Duration,
    statusMap,
    metrics,
  };
};
