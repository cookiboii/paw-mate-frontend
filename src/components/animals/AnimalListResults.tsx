import styles from '../../styles/pages/AnimalList.module.css';
import { Dog } from 'lucide-react';
import EmptyState from '../EmptyState';
import Skeleton from '../Skeleton';
import AnimalCard from '../AnimalCard';
import type { Animal } from '../../types/animal';

interface Props {
  loadError: Error | null;
  isLoading: boolean;
  viewMode: 'infinite' | 'pagination';
  displayedAnimals: Animal[];
  handleResetFilters: () => void;
  onRetry: () => void;
}

export default function AnimalListResults({
  loadError,
  isLoading,
  viewMode,
  displayedAnimals,
  handleResetFilters,
  onRetry,
}: Props) {
  return (
    <>
      {loadError && !isLoading ? (
        <EmptyState
          icon={<Dog size={48} />}
          title="Unable to load animals"
          description="Please check your connection and try again."
          actionLabel="Try again"
          onAction={onRetry}
        />
      ) : isLoading ? (
        <ul className={styles.list}>
          {Array.from({ length: viewMode === 'infinite' ? 9 : 6 }).map((_, idx) => (
            <li key={`skeleton-${idx}`} className={styles.card}>
              <Skeleton type="card" height="240px" />
              <div className={styles.info}>
                <Skeleton type="title" width="60%" height="24px" />
                <Skeleton type="text" width="40%" height="16px" />
              </div>
            </li>
          ))}
        </ul>
      ) : displayedAnimals.length === 0 ? (
        <EmptyState
          icon={<Dog size={48} />}
          title="조건에 맞는 아이가 없습니다."
          description="현재 조건에 부합하는 유기동물이 없습니다. 검색어나 필터를 초기화해 보세요."
          actionLabel="검색 & 필터 초기화"
          onAction={handleResetFilters}
        />
      ) : (
        <ul className={styles.list}>
          {displayedAnimals.map((animal, idx) => (
            <li key={animal.id ?? animal.animalId ?? idx}>
              <AnimalCard animal={animal} showStatus priority={idx < 3} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
