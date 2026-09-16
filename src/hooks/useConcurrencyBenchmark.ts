import { useState } from 'react';
import {
  runConcurrencyBenchmark,
  type ConcurrencyTestResult,
  type RequestMetric,
} from '../utils/performance';

export type ConcurrencyMode = 'concurrent' | 'chunked' | 'sequential';

export default function useConcurrencyBenchmark() {
  const [endpoint, setEndpoint] = useState('/api/v1/animals/cursor?size=10');
  const [isCustomEndpoint, setIsCustomEndpoint] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [totalRequests, setTotalRequests] = useState(20);
  const [mode, setMode] = useState<ConcurrencyMode>('concurrent');
  const [chunkSize, setChunkSize] = useState(5);
  const [bypassCache, setBypassCache] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 20 });
  const [testResult, setTestResult] = useState<ConcurrencyTestResult | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<RequestMetric[]>([]);
  const [error, setError] = useState('');

  const run = async () => {
    const targetEndpoint = isCustomEndpoint ? customUrl.trim() : endpoint;
    if (!targetEndpoint) {
      setError('테스트할 API 엔드포인트를 입력해 주세요.');
      return;
    }
    setError('');
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
          setLiveMetrics((previous) => [...previous, latestMetric]);
        },
      });
      setTestResult(result);
    } catch (error) {
      console.error('Concurrency benchmark failed', error);
      setError('벤치마크 실행에 실패했습니다. 엔드포인트와 네트워크 상태를 확인해 주세요.');
    } finally {
      setIsRunning(false);
    }
  };

  return {
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
    setChunkSize,
    bypassCache,
    setBypassCache,
    isRunning,
    progress,
    testResult,
    liveMetrics,
    error,
    run,
  };
}
