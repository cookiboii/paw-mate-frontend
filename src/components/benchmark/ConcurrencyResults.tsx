import type { CSSProperties } from "react";
import { AlertCircle, BarChart3, CheckCircle2 } from "lucide-react";
import type { ConcurrencyTestResult, RequestMetric } from "../../utils/performance";
import styles from "../../styles/pages/Benchmark.module.css";

interface Props {
  result: ConcurrencyTestResult | null;
  liveMetrics: RequestMetric[];
}

export default function ConcurrencyResults({ result, liveMetrics }: Props) {
  if (!result && liveMetrics.length === 0) return null;
  const metrics = result ? result.metrics : liveMetrics;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}><BarChart3 size={20} /> 동시성 벤치마크 결과 지표</h2>
      <div className={styles.metricsGrid}>
        <Metric label="Total Requests" value={result ? result.totalRequests : liveMetrics.length} unit="req" />
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Success Rate</div>
          <div className={`${styles.metricVal} ${result?.failureCount ? styles.metricValDanger : styles.metricValSuccess}`}>
            {result ? Math.round((result.successCount / result.totalRequests) * 100) : Math.round((liveMetrics.filter((metric) => metric.success).length / (liveMetrics.length || 1)) * 100)}%
          </div>
        </div>
        <Metric label="Throughput (RPS)" value={result?.rps ?? "-"} unit="req/s" />
        <Metric label="Avg Latency" value={result?.avgDuration ?? "-"} unit="ms" />
        <Metric label="P95 Latency" value={result?.p95Duration ?? "-"} unit="ms" />
        <Metric label="Min / Max" value={result ? `${result.minDuration}ms / ${result.maxDuration}ms` : "-"} small />
      </div>
      {result && (
        <div>
          <div className={styles.statusLabel}>응답 상태 코드 분포:</div>
          <div className={styles.statusBadgeGroup}>
            {Object.entries(result.statusMap).map(([status, count]) => {
              const is2xx = status.startsWith("2");
              const is4xx = status.startsWith("4");
              return <span key={status} className={`${styles.statusBadge} ${is2xx ? styles.status2xx : is4xx ? styles.status4xx : styles.status5xx}`}>
                {is2xx ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} HTTP {status} : {count}건
              </span>;
            })}
          </div>
        </div>
      )}
      <div className={styles.timelineContainer}>
        <div className={styles.timelineTitle}><span>요청별 Latency 타임라인 (높을수록 응답 지연)</span><span className={styles.timelineLegend}>🟢 성공 | 🔴 실패</span></div>
        <div className={styles.timelineBars}>
          {metrics.map((metric, index) => {
            const maximum = result ? Math.max(result.maxDuration, 200) : 500;
            const height = Math.min(100, Math.max(12, (metric.duration / maximum) * 100));
            return <div key={index} className={styles.barCol} title={`#${metric.id} - ${metric.duration}ms (Status: ${metric.status})`}>
              <div className={`${styles.barFill} ${metric.success ? styles.barSuccess : styles.barFailed}`} style={{ "--bar-height": `${height}%` } as CSSProperties} />
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, small = false }: { label: string; value: string | number; unit?: string; small?: boolean }) {
  return <div className={styles.metricCard}><div className={styles.metricLabel}>{label}</div><div className={`${styles.metricVal} ${small ? styles.metricValSmall : ""}`}>{value}{unit && <span className={styles.metricUnit}>{unit}</span>}</div></div>;
}
