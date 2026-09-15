import styles from '../../styles/pages/AnimalList.module.css';
import Spinner from '../Spinner';
import { Sparkles } from 'lucide-react';
import type { Animal } from '../../types/animal';

interface Props {
  viewMode: 'infinite' | 'pagination';
  targetRef: (node: HTMLElement | null) => void;
  isFetchingMore: boolean;
  hasNext: boolean;
  isLoading: boolean;
  displayedAnimals: Animal[];
}

export default function AnimalListInfiniteView({
  viewMode,
  targetRef,
  isFetchingMore,
  hasNext,
  isLoading,
  displayedAnimals,
}: Props) {
  return (
    <>
      {viewMode === 'infinite' && (
        <>
          <div ref={targetRef} className={styles.scrollSentinel} />

          {isFetchingMore && (
            <div className={styles.infiniteLoader}>
              <Spinner />
              <span>아이들 정보를 빠르게 불러오는 중...</span>
            </div>
          )}

          {!hasNext && !isLoading && displayedAnimals.length > 0 && (
            <div className={styles.endOfList}>
              <div className={styles.endOfListTitle}>
                <Sparkles size={18} />
                <span>모든 아이들을 다 불러왔습니다 🐾</span>
              </div>
              <p className={styles.endOfListDesc}>
                따뜻한 사랑으로 아이들의 평생 가족이 되어주세요.
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}
