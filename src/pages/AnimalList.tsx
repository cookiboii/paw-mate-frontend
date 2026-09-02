import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Search, X, Dog, Cat, PawPrint, RotateCcw, Infinity as InfinityIcon, LayoutGrid, Sparkles } from 'lucide-react';
import styles from '../styles/AnimalList.module.css';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import AnimalCard from '../components/AnimalCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import useDebounce from '../hooks/useDebounce';
import { fetchAnimalList, fetchAnimalListBySpecies, fetchAnimalCursorList } from '../api/animal';
import { Animal } from '../types/animal';
import { PageResponse, SliceResponse } from '../types/common';

type ViewMode = 'infinite' | 'pagination';

const AnimalList: React.FC = () => {
  usePageTitle('가족을 기다리는 아이들');

  // 뷰 모드 ('infinite' = 초고속 No-Offset 커서 무한스크롤, 'pagination' = 페이지네이션)
  const [viewMode, setViewMode] = useState<ViewMode>('infinite');

  // 동물 데이터 상태
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  // 페이지네이션 모드 전용 상태
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // 무한스크롤 모드 전용 상태
  const [lastAnimalId, setLastAnimalId] = useState<number | string | undefined>(undefined);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 필터 및 검색 상태
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL'); // 'ALL', 'DOG', 'CAT', 'ETC'
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const pageSize = viewMode === 'infinite' ? 9 : 6;

  // ⚡ 1. 페이지네이션 모드 데이터 로딩
  const loadPaginationData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data =
        speciesFilter === 'ALL'
          ? await fetchAnimalList(page, pageSize)
          : await fetchAnimalListBySpecies(speciesFilter, page, pageSize);

      const pageData: PageResponse<Animal> =
        'result' in data && data.result ? (data.result as PageResponse<Animal>) : (data as PageResponse<Animal>);

      setAnimals(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || pageData.content?.length || 0);
    } catch (err) {
      console.error('동물 목록(페이지네이션) 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, speciesFilter, pageSize]);

  // ⚡ 2. 무한스크롤(No-Offset 커서) 데이터 초기 로딩
  const loadInitialInfiniteData = useCallback(async () => {
    setIsLoading(true);
    setHasNext(true);
    setLastAnimalId(undefined);

    try {
      if (speciesFilter === 'ALL') {
        // 🚀 No-Offset 커서 기반 고속 API 호출 (Count 쿼리 0%)
        const res = await fetchAnimalCursorList(undefined, pageSize);
        const sliceData = 'result' in res && res.result ? res.result : (res as SliceResponse<Animal>);
        const content = sliceData.content || [];
        setAnimals(content);
        setHasNext(sliceData.hasNext ?? content.length >= pageSize);
        if (content.length > 0) {
          const lastItem = content[content.length - 1];
          setLastAnimalId(lastItem.id ?? lastItem.animalId);
        }
      } else {
        // 종별 필터는 백엔드 지원에 맞춰 초기 페이지 로드
        const data = await fetchAnimalListBySpecies(speciesFilter, 0, pageSize * 2);
        const pageData: PageResponse<Animal> =
          'result' in data && data.result ? (data.result as PageResponse<Animal>) : (data as PageResponse<Animal>);
        setAnimals(pageData.content || []);
        setHasNext(false);
      }
    } catch (err) {
      console.error('동물 목록(무한스크롤) 초기 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [speciesFilter, pageSize]);

  // ⚡ 3. 무한스크롤 다음 커서 데이터 로딩
  const loadNextInfiniteData = useCallback(async () => {
    if (isFetchingMore || !hasNext || viewMode !== 'infinite' || speciesFilter !== 'ALL') return;

    setIsFetchingMore(true);
    try {
      const res = await fetchAnimalCursorList(lastAnimalId, pageSize);
      const sliceData = 'result' in res && res.result ? res.result : (res as SliceResponse<Animal>);
      const newItems = sliceData.content || [];

      if (newItems.length > 0) {
        setAnimals((prev) => {
          // 중복 방지 (ID 기준)
          const existingIds = new Set(prev.map((a) => a.id ?? a.animalId));
          const uniqueNew = newItems.filter((a) => !existingIds.has(a.id ?? a.animalId));
          return [...prev, ...uniqueNew];
        });
        const lastItem = newItems[newItems.length - 1];
        setLastAnimalId(lastItem.id ?? lastItem.animalId);
        setHasNext(sliceData.hasNext ?? newItems.length >= pageSize);
      } else {
        setHasNext(false);
      }
    } catch (err) {
      console.error('동물 목록 커서 추가 조회 실패:', err);
      setHasNext(false);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasNext, viewMode, speciesFilter, lastAnimalId, pageSize]);

  // 뷰 모드 및 필터 변경에 따른 데이터 fetch
  useEffect(() => {
    if (viewMode === 'pagination') {
      loadPaginationData();
    } else {
      loadInitialInfiniteData();
    }
  }, [viewMode, page, speciesFilter, loadPaginationData, loadInitialInfiniteData]);

  // 무한스크롤 IntersectionObserver 감지 엘리먼트 콜백
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingMore || viewMode !== 'infinite') return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNext) {
          loadNextInfiniteData();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingMore, viewMode, hasNext, loadNextInfiniteData]
  );

  // 프론트엔드 다중 필터링 (디바운스 검색어 + 성별)
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      // 1. 성별 필터
      if (genderFilter !== 'ALL') {
        const g = (animal.gender || '').toUpperCase();
        if (genderFilter === 'MALE' && !(g === 'M' || g === 'MALE')) return false;
        if (genderFilter === 'FEMALE' && !(g === 'F' || g === 'FEMALE')) return false;
      }
      // 2. 검색어 필터 (품종, 색상, 종)
      if (debouncedSearchQuery.trim()) {
        const q = debouncedSearchQuery.toLowerCase().trim();
        const breed = (animal.breed || '').toLowerCase();
        const species = (animal.species || '').toLowerCase();
        const color = (animal.color || '').toLowerCase();
        if (!breed.includes(q) && !species.includes(q) && !color.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [animals, genderFilter, debouncedSearchQuery]);

  const handleSpeciesChange = (type: string) => {
    setSpeciesFilter(type);
    setPage(0);
    setLastAnimalId(undefined);
  };

  const handleResetFilters = () => {
    setSpeciesFilter('ALL');
    setGenderFilter('ALL');
    setSearchQuery('');
    setPage(0);
    setLastAnimalId(undefined);
  };

  const isFilteringActive = speciesFilter !== 'ALL' || genderFilter !== 'ALL' || searchQuery.trim().length > 0;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>가족을 기다리는 아이들</h2>
        <p className={styles.subtitle}>새로운 세상을 선물해 줄 따뜻한 손길을 기다립니다.</p>
      </div>

      {/* 검색 및 다중 필터 섹션 */}
      <div className={styles.filterSection}>
        <div className={styles.searchBarWrapper}>
          <span className={styles.searchIcon} style={{ display: 'flex', alignItems: 'center' }}>
            <Search size={18} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="품종, 색상 등으로 검색 (예: 푸들, 흰색)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="동물 검색"
          />
          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
              aria-label="검색어 지우기"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.filterControls}>
          {/* 종 필터 */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>종:</span>
            {[
              { key: 'ALL', label: '전체', icon: null },
              { key: 'DOG', label: '강아지', icon: <Dog size={15} /> },
              { key: 'CAT', label: '고양이', icon: <Cat size={15} /> },
              { key: 'ETC', label: '기타', icon: <PawPrint size={15} /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                className={`${styles.filterChip} ${speciesFilter === key ? styles.activeChip : ''}`}
                onClick={() => handleSpeciesChange(key)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* 성별 필터 */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>성별:</span>
            {[
              { key: 'ALL', label: '전체 성별' },
              { key: 'MALE', label: '수컷' },
              { key: 'FEMALE', label: '암컷' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`${styles.filterChip} ${genderFilter === key ? styles.activeChip : ''}`}
                onClick={() => setGenderFilter(key as 'ALL' | 'MALE' | 'FEMALE')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 헤더 (카운트 뱃지 & 뷰 모드 전환 토글 & 필터 초기화) */}
      <div className={styles.resultsHeader} aria-live="polite">
        <div className={styles.resultCountBadge}>
          <PawPrint size={15} />
          <span>현재</span>
          <span className={styles.countHighlight}>
            {isLoading ? '...' : filteredAnimals.length}
          </span>
          <span>마리의 아이가 가족을 기다리고 있어요</span>
          {viewMode === 'pagination' && totalElements > 0 && !isFilteringActive && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              (전체 {totalElements}마리)
            </span>
          )}
        </div>

        <div className={styles.headerControls}>
          {/* 뷰 모드 토글: 피드로 보기 vs 페이지별 보기 */}
          <div className={styles.viewToggleGroup} role="group" aria-label="보기 방식 선택">
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === 'infinite' ? styles.activeToggle : ''}`}
              onClick={() => setViewMode('infinite')}
              title="스크롤하여 연속으로 둘러보기"
            >
              <InfinityIcon size={14} />
              <span>피드로 보기</span>
            </button>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === 'pagination' ? styles.activeToggle : ''}`}
              onClick={() => setViewMode('pagination')}
              title="페이지 번호로 나누어 보기"
            >
              <LayoutGrid size={14} />
              <span>페이지별 보기</span>
            </button>
          </div>

          {isFilteringActive && (
            <button className={styles.resetBtn} onClick={handleResetFilters} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={14} />
              <span>필터 초기화</span>
            </button>
          )}
        </div>

      </div>

      <div className={styles.container}>
        {isLoading ? (
          <ul className={styles.list}>
            {Array.from({ length: pageSize }).map((_, index) => (
              <li key={`skeleton-${index}`} className={styles.card}>
                <Skeleton type="card" height="240px" />
                <div className={styles.info}>
                  <Skeleton type="title" width="60%" height="24px" />
                  <Skeleton type="text" width="40%" height="16px" />
                </div>
              </li>
            ))}
          </ul>
        ) : filteredAnimals.length === 0 ? (
          <EmptyState
            icon={<Dog size={48} color="var(--text-muted)" />}
            title="조건에 맞는 아이가 없습니다."
            description="현재 조건에 부합하는 유기동물이 없습니다. 검색어나 필터를 초기화해 보세요."
            actionLabel="검색 & 필터 초기화"
            onAction={handleResetFilters}
          />
        ) : (
          <ul className={styles.list}>
            {filteredAnimals.map((animal, idx) => (
              <li key={animal.id ?? animal.animalId ?? idx} style={{ listStyle: 'none' }}>
                <AnimalCard animal={animal} showStatus priority={idx < 3} />
              </li>
            ))}
          </ul>
        )}

        {/* 1. 페이지네이션 모드 하단 번호 UI */}
        {viewMode === 'pagination' && !isLoading && filteredAnimals.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}

        {/* 2. 무한 스크롤 모드 하단 관찰자 & 로딩 상태 */}
        {viewMode === 'infinite' && (
          <>
            {/* IntersectionObserver 타겟 */}
            <div ref={lastElementRef} style={{ height: '20px', margin: '10px 0' }} />

            {/* 추가 로딩 중 스피너 */}
            {isFetchingMore && (
              <div className={styles.infiniteLoader}>
                <Spinner />
                <span>아이들 정보를 빠르게 불러오는 중...</span>
              </div>
            )}

            {/* 모든 목록 탐색 완료 종단 배너 */}
            {!hasNext && !isLoading && filteredAnimals.length > 0 && (
              <div className={styles.endOfList}>
                <div className={styles.endOfListTitle}>
                  <Sparkles size={18} color="var(--primary-color)" />
                  <span>모든 아이들을 다 불러왔습니다 🐾</span>
                </div>
                <p className={styles.endOfListDesc}>
                  따뜻한 사랑으로 아이들의 평생 가족이 되어주세요.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnimalList;
