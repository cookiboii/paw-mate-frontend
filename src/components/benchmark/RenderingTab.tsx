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

interface MockPet {
  id: number;
  name: string;
  species: 'DOG' | 'CAT' | 'OTHER';
  age: number;
  breed: string;
  status: 'PROTECTED' | 'ADOPTED';
}


export default function RenderingTab() {
  // ================= 2. React 19 Rendering Stress State =================
  const [isPending, startTransition] = useTransition();
  const [useTransitionFlag, setUseTransitionFlag] = useState<boolean>(true);
  const [itemCount, setItemCount] = useState<number>(1000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deferredQuery, setDeferredQuery] = useState<string>('');

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

  const { pets: filteredPets, duration: renderDuration } = useMemo(() => {
    const start = performance.now();
    const query = useTransitionFlag ? deferredQuery : searchQuery;
    const result = mockPets.filter(
      (pet) =>
        pet.name.includes(query) ||
        pet.breed.includes(query) ||
        pet.species.toLowerCase().includes(query.toLowerCase())
    );
    const duration = performance.now() - start;
    return { pets: result, duration: Math.round(duration * 100) / 100 };
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


  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Zap size={20} /> React 19 동시성 렌더링(Concurrent Mode) 스트레스
      </h2>
      <p className={styles.cardSubDesc}>
        수천 개의 복잡한 DOM 요소를 실시간으로 필터링할 때, React 19의 <code>useTransition</code>을 켰을 때와
        껐을 때의 <strong>입력 지연(Input Latency) 및 반응 속도 차이</strong>를 직접 비교해 보세요.
      </p>

      <div className={styles.stressControls}>
        <div className={styles.flexInputCol}>
          <input
            type="text"
            className={`${styles.input} ${styles.fullWidthInput}`}
            placeholder="동물 이름, 품종(골든 리트리버 등) 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.sliderCol}>
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
          <Clock size={16} />
          <span>연산 & 렌더링 소요 시간:</span>
          <strong>{renderDuration} ms</strong>
        </div>

        <div className={styles.renderStatsItem}>
          <Activity size={16} />
          <span>필터링된 아이템:</span>
          <strong>{filteredPets.length.toLocaleString()} / {mockPets.length.toLocaleString()}개</strong>
        </div>

        <div className={styles.renderStatsItem}>
          <span>동시성 상태:</span>
          <strong className={isPending ? styles.statusPending : styles.statusStable}>
            {isPending ? '백그라운드 렌더링 중 (입력 끊김 없음)' : '안정 상태'}
          </strong>
        </div>
      </div>

      {/* 렌더링 그리드 */}
      <div className={styles.renderGrid}>
        {filteredPets.slice(0, 100).map((pet) => (
          <div key={pet.id} className={styles.mockAnimalCard}>
            <div className={styles.mockPetName}>{pet.name}</div>
            <div className={styles.mockPetBreed}>{pet.breed}</div>
            <div className={`${styles.mockPetStatus} ${pet.status === 'ADOPTED' ? styles.petStatusAdopted : styles.petStatusProtecting}`}>
              {pet.status === 'ADOPTED' ? '입양 완료' : '보호 중'} ({pet.age}살)
            </div>
          </div>
        ))}
      </div>
      {filteredPets.length > 100 && (
        <div className={styles.renderLimitNotice}>
          * UI 과부하 방지를 위해 상위 100개 카드만 표시 중입니다. (전체 {filteredPets.length}개 연산 완료)
        </div>
      )}
    </div>
  );
}
