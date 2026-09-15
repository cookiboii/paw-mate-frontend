import { useState } from 'react';
import { Zap, Flame, Gauge, Terminal } from 'lucide-react';
import styles from '../styles/pages/Benchmark.module.css';
import usePageTitle from '../hooks/usePageTitle';
import ConcurrencyTab from '../components/benchmark/ConcurrencyTab';
import RenderingTab from '../components/benchmark/RenderingTab';
import VitalsTab from '../components/benchmark/VitalsTab';
import K6Tab from '../components/benchmark/K6Tab';
type TabType = 'concurrency' | 'rendering' | 'vitals' | 'k6';

export default function BenchmarkPage() {
  usePageTitle('성능 & 동시성 벤치마크');
  const [activeTab, setActiveTab] = useState<TabType>('concurrency');
  const [visited, setVisited] = useState<Set<TabType>>(() => new Set(['concurrency']));
  const selectTab = (tab: TabType) => {
    setActiveTab(tab);
    setVisited((previous) => new Set([...previous, tab]));
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
          onClick={() => selectTab('concurrency')}
        >
          <Flame size={18} /> API 동시성 & 부하 테스트
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'rendering' ? styles.tabButtonActive : ''}`}
          onClick={() => selectTab('rendering')}
        >
          <Zap size={18} /> React 19 렌더링 스트레스
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'vitals' ? styles.tabButtonActive : ''}`}
          onClick={() => selectTab('vitals')}
        >
          <Gauge size={18} /> Web Vitals & FPS HUD
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'k6' ? styles.tabButtonActive : ''}`}
          onClick={() => selectTab('k6')}
        >
          <Terminal size={18} /> k6 스크립트 가이드
        </button>
      </div>

      {/* 탭 1: API 동시성 테스트 */}

      <div hidden={activeTab !== 'concurrency'}><ConcurrencyTab /></div>
      {visited.has('rendering') && <div hidden={activeTab !== 'rendering'}><RenderingTab /></div>}
      {visited.has('vitals') && <div hidden={activeTab !== 'vitals'}><VitalsTab active={activeTab === 'vitals'} /></div>}
      {visited.has('k6') && <div hidden={activeTab !== 'k6'}><K6Tab /></div>}
    </div>
  );
}
