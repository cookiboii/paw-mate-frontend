import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cat, Dog, PawPrint, Sparkles } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import EmptyState from '../components/EmptyState';
import HomeHero from '../components/home/HomeHero';
import HomeInfoSections from '../components/home/HomeInfoSections';
import { useAnimalListQuery } from '../hooks/queries/animals';
import usePageTitle from '../hooks/usePageTitle';
import useScrollReveal from '../hooks/useScrollReveal';
import styles from '../styles/pages/HomePage.module.css';

export default function HomePage() {
  usePageTitle('AdoptMate | 새로운 가족을 만나는 곳', false);
  const [selectedSpecies, setSelectedSpecies] = useState<'ALL' | 'DOG' | 'CAT'>('ALL');
  const newArrivalsRef = useScrollReveal<HTMLDivElement>();
  const recentAnimalsQuery = useAnimalListQuery(0, 6, selectedSpecies);
  const recentAnimals = recentAnimalsQuery.data?.content || [];

  return (
    <div className={styles.homeContainer}>
      <HomeHero />
      <section className={styles.newArrivalsSection} ref={newArrivalsRef}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubTitle}>
            <Sparkles size={14} />
            NEW ARRIVALS
          </span>
          <h2>가족을 기다리는 아이들</h2>
          <p>구조 후 건강 검진과 돌봄을 받으며 따뜻한 평생 반려인을 기다리고 있습니다.</p>
        </div>
        <div className={styles.speciesTabs}>
          <button
            type="button"
            className={`${styles.speciesTabBtn} ${selectedSpecies === 'ALL' ? styles.activeSpeciesTab : ''}`}
            onClick={() => setSelectedSpecies('ALL')}
          >
            <PawPrint size={16} />
            <span>전체 보기</span>
          </button>
          <button
            type="button"
            className={`${styles.speciesTabBtn} ${selectedSpecies === 'DOG' ? styles.activeSpeciesTab : ''}`}
            onClick={() => setSelectedSpecies('DOG')}
          >
            <Dog size={16} />
            <span>강아지</span>
          </button>
          <button
            type="button"
            className={`${styles.speciesTabBtn} ${selectedSpecies === 'CAT' ? styles.activeSpeciesTab : ''}`}
            onClick={() => setSelectedSpecies('CAT')}
          >
            <Cat size={16} />
            <span>고양이</span>
          </button>
        </div>
        <div className={styles.animalGrid}>
          {recentAnimalsQuery.isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={`skeleton-${index}`} className={styles.animalCardSkeleton}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonSub}`} />
                </div>
              </div>
            ))
          ) : recentAnimalsQuery.isError ? (
            <div className={styles.gridFullWidth}>
              <EmptyState
                title="동물 정보를 불러오지 못했습니다."
                description="잠시 후 다시 시도해 주세요."
                actionLabel="다시 시도"
                actionHint="연결 상태를 확인해 주세요."
                onAction={() => recentAnimalsQuery.refetch()}
              />
            </div>
          ) : recentAnimals.length === 0 ? (
            <div className={styles.gridFullWidth}>
              <EmptyState
                title="현재 조건에 맞는 아이가 없습니다."
                description="새로운 가족을 기다리는 아이들이 곧 등록될 예정입니다."
                actionLabel="동물 전체 목록 둘러보기"
                actionPath="/animals"
              />
            </div>
          ) : (
            recentAnimals.map((animal) => (
              <AnimalCard
                key={animal.id || animal.animalId}
                animal={animal}
                extraBadgeText="NEW"
                showStatus
              />
            ))
          )}
        </div>
        <div className={styles.viewAllWrapper}>
          <Link to="/animals" className={styles.viewAllBtn}>
            <span>보호 중인 아이들 전체 보기 ({recentAnimals.length > 0 ? '더보기' : '이동'})</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <HomeInfoSections />
    </div>
  );
}
