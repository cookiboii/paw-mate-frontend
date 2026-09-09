import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dog, Sparkles } from 'lucide-react';
import styles from '../styles/pages/AnimalList.module.css';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import AnimalCard from '../components/AnimalCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import AnimalFilterBar from '../components/AnimalFilterBar';
import usePageTitle from '../hooks/usePageTitle';
import useDebounce from '../hooks/useDebounce';
import { useCursorScroll } from '../hooks/useCursorScroll';
import { fetchAllAnimals, fetchAnimalList, fetchAnimalListBySpecies, fetchAnimalCursorList, fetchAnimalCursorListBySpecies } from '../api/animal';
import { Animal } from '../types/animal';

type ViewMode = 'infinite' | 'pagination';

const AnimalList: React.FC = () => {
  usePageTitle('가족을 기다리는 아이들');

  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query Parameters 초기값 파싱
  const initialMode = searchParams.get('mode') === 'pagination'
    ? 'pagination'
    : localStorage.getItem('animal-list-view-mode') === 'pagination'
      ? 'pagination'
      : 'infinite';
  const initialSpecies = searchParams.get('species') || 'ALL';
  const initialGender = (['MALE', 'FEMALE'].includes(searchParams.get('gender') || '') 
    ? searchParams.get('gender') 
    : 'ALL') as 'ALL' | 'MALE' | 'FEMALE';
  const initialPage = Math.max(0, parseInt(searchParams.get('page') || '0', 10) || 0);

  // 1. 뷰 모드 및 필터 상태
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [speciesFilter, setSpeciesFilter] = useState<string>(initialSpecies);
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>(initialGender);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [allFilterCandidates, setAllFilterCandidates] = useState<Animal[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);

  // 2. 페이지네이션 모드 상태
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [paginationAnimals, setPaginationAnimals] = useState<Animal[]>([]);
  const [isPaginationLoading, setIsPaginationLoading] = useState<boolean>(false);

  // URL 쿼리 파라미터 동기화 (필터 및 뷰 모드 변경 시)
  useEffect(() => {
    const params = new URLSearchParams();
    if (viewMode !== 'infinite') params.set('mode', viewMode);
    if (speciesFilter !== 'ALL') params.set('species', speciesFilter);
    if (genderFilter !== 'ALL') params.set('gender', genderFilter);
    if (viewMode === 'pagination' && page > 0) params.set('page', String(page));

    setSearchParams(params, { replace: true });
  }, [viewMode, speciesFilter, genderFilter, page, setSearchParams]);

  useEffect(() => {
    localStorage.setItem('animal-list-view-mode', viewMode);
  }, [viewMode]);

  // 3. 무한 스크롤 커서 페칭 콜백
  const cursorFetcher = useCallback(
    async (lastId: string | number | undefined, pageSize: number) => {
      if (speciesFilter !== 'ALL') {
        return fetchAnimalCursorListBySpecies(speciesFilter, lastId, pageSize);
      }
      return fetchAnimalCursorList(lastId, pageSize);
    },
    [speciesFilter]
  );

  // 4. No-Offset 커서 기반 고속 무한 스크롤 훅 적용
  const {
    items: infiniteAnimals,
    isLoading: isInfiniteLoading,
    isFetchingMore,
    hasNext,
    targetRef,
    refresh: refreshInfinite,
  } = useCursorScroll<Animal>({
    fetcher: cursorFetcher,
    getId: (item) => item.id ?? item.animalId ?? '',
    pageSize: 9,
    enabled: viewMode === 'infinite',
    dependencies: [speciesFilter],
  });

  // 5. 페이지네이션 모드 데이터 로드
  useEffect(() => {
    if (viewMode !== 'pagination') return;

    let isMounted = true;
    setIsPaginationLoading(true);

    const loadPaged = async () => {
      try {
        const pageData =
          speciesFilter === 'ALL'
            ? await fetchAnimalList(page, 6)
            : await fetchAnimalListBySpecies(speciesFilter, page, 6);

        if (isMounted) {
          setPaginationAnimals(pageData.content || []);
          setTotalPages(pageData.totalPages || 1);
        }
      } catch (err) {
        console.error('페이지네이션 데이터 로드 실패:', err);
      } finally {
        if (isMounted) setIsPaginationLoading(false);
      }
    };

    loadPaged();
    return () => {
      isMounted = false;
    };
  }, [viewMode, page, speciesFilter]);

  const needsCompleteFilterSet = genderFilter !== 'ALL' || debouncedSearchQuery.trim() !== '';

  useEffect(() => {
    if (!needsCompleteFilterSet) {
      setAllFilterCandidates([]);
      return;
    }

    let isMounted = true;
    setIsFilterLoading(true);
    fetchAllAnimals(speciesFilter)
      .then((animals) => {
        if (isMounted) setAllFilterCandidates(animals);
      })
      .catch((error) => {
        console.error('Failed to load complete animal list for filtering:', error);
      })
      .finally(() => {
        if (isMounted) setIsFilterLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [needsCompleteFilterSet, speciesFilter]);

  // 6. 클라이언트 레벨 검색어 & 성별 필터링
  const rawList = needsCompleteFilterSet
    ? allFilterCandidates
    : viewMode === 'infinite'
      ? infiniteAnimals
      : paginationAnimals;
  const filteredAnimals = useMemo(() => {
    let list = rawList;

    if (genderFilter !== 'ALL') {
      list = list.filter((a) => a.gender === genderFilter);
    }

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          (a.breed || '').toLowerCase().includes(q) ||
          (a.name || '').toLowerCase().includes(q) ||
          (a.color || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [rawList, genderFilter, debouncedSearchQuery]);

  const displayedAnimals =
    viewMode === 'pagination' && needsCompleteFilterSet
      ? filteredAnimals.slice(page * 6, (page + 1) * 6)
      : filteredAnimals;
  const displayedTotalPages = needsCompleteFilterSet
    ? Math.max(1, Math.ceil(filteredAnimals.length / 6))
    : totalPages;

  const isLoading = isFilterLoading || (viewMode === 'infinite' ? isInfiniteLoading : isPaginationLoading);
  const hasActiveFilter = speciesFilter !== 'ALL' || genderFilter !== 'ALL' || searchQuery !== '';

  const handleResetFilters = useCallback(() => {
    setSpeciesFilter('ALL');
    setGenderFilter('ALL');
    setSearchQuery('');
    setPage(0);
    if (viewMode === 'infinite') {
      refreshInfinite();
    }
  }, [viewMode, refreshInfinite]);

  return (
    <div className={styles.pageWrapper}>
      {/* 헤더 */}
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>가족을 기다리는 아이들</h1>
        <p className={styles.subtitle}>따뜻한 관심으로 유기동물들에게 평생 가족을 선물해 주세요.</p>
      </header>

      {/* 필터 & 검색 바 */}
      <AnimalFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        speciesFilter={speciesFilter}
        onSpeciesChange={(sp) => {
          setSpeciesFilter(sp);
          setPage(0);
        }}
        genderFilter={genderFilter}
        onGenderChange={(gender) => {
          setGenderFilter(gender);
          setPage(0);
        }}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          setPage(0);
        }}
        totalCount={filteredAnimals.length}
        onReset={handleResetFilters}
        hasActiveFilter={hasActiveFilter}
      />

      {/* 동물 카드 리스트 영역 */}
      <div className={styles.container}>
        {isLoading ? (
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

        {/* 1. 페이지네이션 뷰 하단 번호 이동 */}
        {viewMode === 'pagination' && !isLoading && displayedAnimals.length > 0 && (
          <Pagination currentPage={page} totalPages={displayedTotalPages} onPageChange={setPage} />
        )}

        {/* 2. 무한 스크롤 뷰 하단 센서 & 상태 UI */}
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
      </div>
    </div>
  );
};

export default AnimalList;
