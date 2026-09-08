import React from 'react';
import { Search, X, Dog, Cat, PawPrint, RotateCcw, Infinity as InfinityIcon, LayoutGrid, Sparkles } from 'lucide-react';
import styles from '../styles/pages/AnimalList.module.css';

export interface AnimalFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  speciesFilter: string;
  onSpeciesChange: (species: string) => void;
  genderFilter: 'ALL' | 'MALE' | 'FEMALE';
  onGenderChange: (gender: 'ALL' | 'MALE' | 'FEMALE') => void;
  viewMode: 'infinite' | 'pagination';
  onViewModeChange: (mode: 'infinite' | 'pagination') => void;
  totalCount: number;
  onReset: () => void;
  hasActiveFilter: boolean;
}

/**
 * ?�� ?�물 목록 검??& ?�중 ?�터 & �?모드 ?��? 컴포?�트
 */
const AnimalFilterBar: React.FC<AnimalFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  speciesFilter,
  onSpeciesChange,
  genderFilter,
  onGenderChange,
  viewMode,
  onViewModeChange,
  totalCount,
  onReset,
  hasActiveFilter,
}) => {
  return (
    <>
      <section className={styles.filterSection} aria-label="보호 ?�물 검??�??�터">
        {/* 검???�력�?*/}
        <div className={styles.searchBarWrapper}>
          <Search className={styles.searchIcon} size={20} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="?�종 ?�는 ?�름?�로 검?�해 보세??(?? 말티�? 코숏)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="?�물 ?�종 ?�는 ?�름 검??
          />
          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => onSearchChange('')}
              aria-label="검?�어 지?�기"
              type="button"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 축종 & ?�별 ?�터 �?*/}
        <div className={styles.filterControls}>
          {/* 축종 ?�택 */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>?�물 종류:</span>
            <button
              type="button"
              className={`${styles.filterChip} ${speciesFilter === 'ALL' ? styles.activeChip : ''}`}
              onClick={() => onSpeciesChange('ALL')}
            >
              ?�체
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${speciesFilter === 'DOG' ? styles.activeChip : ''}`}
              onClick={() => onSpeciesChange('DOG')}
            >
              <Dog size={16} className={styles.chipIcon} />
              강아지
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${speciesFilter === 'CAT' ? styles.activeChip : ''}`}
              onClick={() => onSpeciesChange('CAT')}
            >
              <Cat size={16} className={styles.chipIcon} />
              고양??            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${speciesFilter === 'ETC' ? styles.activeChip : ''}`}
              onClick={() => onSpeciesChange('ETC')}
            >
              <PawPrint size={16} className={styles.chipIcon} />
              기�?
            </button>
          </div>

          {/* ?�별 ?�택 */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>?�별:</span>
            <button
              type="button"
              className={`${styles.filterChip} ${genderFilter === 'ALL' ? styles.activeChip : ''}`}
              onClick={() => onGenderChange('ALL')}
            >
              ?�체
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${genderFilter === 'MALE' ? styles.activeChip : ''}`}
              onClick={() => onGenderChange('MALE')}
            >
              ?�아
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${genderFilter === 'FEMALE' ? styles.activeChip : ''}`}
              onClick={() => onGenderChange('FEMALE')}
            >
              ?�아
            </button>
          </div>
        </div>

        {/* ?���??�용???�터 ?�그 �?(Active Tag Chips) */}
        {hasActiveFilter && (
          <div className={styles.activeTagsContainer}>
            <span className={styles.activeTagsLabel}>?�용???�터:</span>
            {speciesFilter !== 'ALL' && (
              <span className={styles.activeTagChip}>
                <span>{speciesFilter === 'DOG' ? '강아지' : speciesFilter === 'CAT' ? '고양?? : '기�? 축종'}</span>
                <button
                  type="button"
                  onClick={() => onSpeciesChange('ALL')}
                  className={styles.activeTagRemoveBtn}
                  aria-label="축종 ?�터 ?�제"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {genderFilter !== 'ALL' && (
              <span className={styles.activeTagChip}>
                <span>{genderFilter === 'MALE' ? '?�아' : '?�아'}</span>
                <button
                  type="button"
                  onClick={() => onGenderChange('ALL')}
                  className={styles.activeTagRemoveBtn}
                  aria-label="?�별 ?�터 ?�제"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {searchQuery.trim() !== '' && (
              <span className={styles.activeTagChip}>
                <span>검?? "{searchQuery.trim()}"</span>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className={styles.activeTagRemoveBtn}
                  aria-label="검?�어 초기??
                >
                  <X size={14} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={onReset}
              className={`${styles.resetBtn} ${styles.resetBtnSmall}`}
            >
              ?�체 ?�제
            </button>
          </div>
        )}
      </section>

      {/* 결과 ?�더 (카운??뱃�?, 리셋 버튼, �?모드 ?��?) */}
      <div className={styles.resultsHeader}>
        <div className={styles.resultCountBadge}>
          <Sparkles size={18} color="var(--primary-color)" />
          <span>
            �?<strong className={styles.countHighlight}>{totalCount}</strong>마리???�이?�이 기다리고 ?�어??          </span>
          {hasActiveFilter && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={onReset}
              title="?�터 초기??
            >
              <RotateCcw size={13} className={styles.resetIcon} />
              ?�터 초기??            </button>
          )}
        </div>

        <div className={styles.headerControls}>
          <div className={styles.viewToggleGroup} role="group" aria-label="목록 보기 방식">
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === 'infinite' ? styles.activeToggle : ''}`}
              onClick={() => onViewModeChange('infinite')}
              title="?�크롤하???�속?�로 ?�러보기"
            >
              <InfinityIcon size={16} />
              ?�드�?보기
            </button>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === 'pagination' ? styles.activeToggle : ''}`}
              onClick={() => onViewModeChange('pagination')}
              title="?�이지 번호�??�누??보기"
            >
              <LayoutGrid size={16} />
              ?�이지�?보기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(AnimalFilterBar);
