import React from 'react';
import { Search, X, Dog, Cat, PawPrint, RotateCcw, Infinity as InfinityIcon, LayoutGrid, Sparkles } from 'lucide-react';
import styles from '../styles/AnimalList.module.css';

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
 * 🐾 동물 목록 검색 & 다중 필터 & 뷰 모드 토글 컴포넌트
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
      <section className={styles.filterSection} aria-label="보호 동물 검색 및 필터">
        {/* 검색 입력창 */}
        <div className={styles.searchBarWrapper}>
          <Search className={styles.searchIcon} size={20} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="품종 또는 이름으로 검색해 보세요 (예: 말티즈, 코숏)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="동물 품종 또는 이름 검색"
          />
          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => onSearchChange('')}
              aria-label="검색어 지우기"
              type="button"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 축종 & 성별 필터 칩 */}
        <div className={styles.filterControls}>
          {/* 축종 선택 */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>동물 종류:</span>
            <button
              type="button"
              className={`${styles.filterChip} ${speciesFilter === 'ALL' ? styles.activeChip : ''}`}
              onClick={() => onSpeciesChange('ALL')}
            >
              전체
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${speciesFilter === 'DOG' ? styles.activeChip : ''}`}
              onClick={() => onSpeciesChange('DOG')}
            >
              <Dog size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              강아지
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${speciesFilter === 'CAT' ? styles.activeChip : ''}`}
              onClick={() => onSpeciesChange('CAT')}
            >
              <Cat size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              고양이
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${speciesFilter === 'ETC' ? styles.activeChip : ''}`}
              onClick={() => onSpeciesChange('ETC')}
            >
              <PawPrint size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              기타
            </button>
          </div>

          {/* 성별 선택 */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>성별:</span>
            <button
              type="button"
              className={`${styles.filterChip} ${genderFilter === 'ALL' ? styles.activeChip : ''}`}
              onClick={() => onGenderChange('ALL')}
            >
              전체
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${genderFilter === 'MALE' ? styles.activeChip : ''}`}
              onClick={() => onGenderChange('MALE')}
            >
              남아
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${genderFilter === 'FEMALE' ? styles.activeChip : ''}`}
              onClick={() => onGenderChange('FEMALE')}
            >
              여아
            </button>
          </div>
        </div>

        {/* 🏷️ 적용된 필터 태그 칩 (Active Tag Chips) */}
        {hasActiveFilter && (
          <div className={styles.activeTagsContainer}>
            <span className={styles.activeTagsLabel}>적용된 필터:</span>
            {speciesFilter !== 'ALL' && (
              <span className={styles.activeTagChip}>
                <span>{speciesFilter === 'DOG' ? '강아지' : speciesFilter === 'CAT' ? '고양이' : '기타 축종'}</span>
                <button
                  type="button"
                  onClick={() => onSpeciesChange('ALL')}
                  className={styles.activeTagRemoveBtn}
                  aria-label="축종 필터 해제"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {genderFilter !== 'ALL' && (
              <span className={styles.activeTagChip}>
                <span>{genderFilter === 'MALE' ? '남아' : '여아'}</span>
                <button
                  type="button"
                  onClick={() => onGenderChange('ALL')}
                  className={styles.activeTagRemoveBtn}
                  aria-label="성별 필터 해제"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {searchQuery.trim() !== '' && (
              <span className={styles.activeTagChip}>
                <span>검색: "{searchQuery.trim()}"</span>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className={styles.activeTagRemoveBtn}
                  aria-label="검색어 초기화"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={onReset}
              className={styles.resetBtn}
              style={{ fontSize: '0.82rem', marginLeft: '4px' }}
            >
              전체 해제
            </button>
          </div>
        )}
      </section>

      {/* 결과 헤더 (카운트 뱃지, 리셋 버튼, 뷰 모드 토글) */}
      <div className={styles.resultsHeader}>
        <div className={styles.resultCountBadge}>
          <Sparkles size={18} color="var(--primary-color)" />
          <span>
            총 <strong className={styles.countHighlight}>{totalCount}</strong>마리의 아이들이 기다리고 있어요
          </span>
          {hasActiveFilter && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={onReset}
              title="필터 초기화"
            >
              <RotateCcw size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
              필터 초기화
            </button>
          )}
        </div>

        <div className={styles.headerControls}>
          <div className={styles.viewToggleGroup} role="group" aria-label="목록 보기 방식">
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === 'infinite' ? styles.activeToggle : ''}`}
              onClick={() => onViewModeChange('infinite')}
              title="스크롤하여 연속으로 둘러보기"
            >
              <InfinityIcon size={16} />
              피드로 보기
            </button>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === 'pagination' ? styles.activeToggle : ''}`}
              onClick={() => onViewModeChange('pagination')}
              title="페이지 번호로 나누어 보기"
            >
              <LayoutGrid size={16} />
              페이지별 보기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(AnimalFilterBar);
