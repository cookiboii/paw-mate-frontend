import { useAnimalListQuery, useAllAnimalsQuery } from '../hooks/queries/animals';
import AnimalListInfiniteView from '../components/animals/AnimalListInfiniteView';
import AnimalListPaginationView from '../components/animals/AnimalListPaginationView';
import AnimalListResults from '../components/animals/AnimalListResults';
import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import styles from '../styles/pages/AnimalList.module.css';

import AnimalFilterBar from '../components/AnimalFilterBar';
import usePageTitle from '../hooks/usePageTitle';
import useDebounce from '../hooks/useDebounce';
import { useAnimalFilters } from '../hooks/useAnimalFilters';
import { useCursorScroll } from '../hooks/useCursorScroll';
import {
  fetchAllAnimals,
  fetchAnimalList,
  fetchAnimalListBySpecies,
  fetchAnimalCursorList,
  fetchAnimalCursorListBySpecies,
} from '../api/animal';
import { Animal } from '../types/animal';

type ViewMode = 'infinite' | 'pagination';

const AnimalList: React.FC = () => {
  usePageTitle('가족을 기다리는 아이들');

  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query Parameters 초기값 파싱
  const initialMode =
    searchParams.get('mode') === 'pagination'
      ? 'pagination'
      : localStorage.getItem('animal-list-view-mode') === 'pagination'
        ? 'pagination'
        : 'infinite';
  const initialSpecies = searchParams.get('species') || 'ALL';
  const initialGender = (
    ['MALE', 'FEMALE'].includes(searchParams.get('gender') || '')
      ? searchParams.get('gender')
      : 'ALL'
  ) as 'ALL' | 'MALE' | 'FEMALE';
  const initialSearchQuery = searchParams.get('q') || '';
  const initialPage = Math.max(0, parseInt(searchParams.get('page') || '0', 10) || 0);

  // 1. 뷰 모드 및 필터 상태
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [speciesFilter, setSpeciesFilter] = useState<string>(initialSpecies);
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>(initialGender);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 2. 페이지네이션 모드 상태
  const [page, setPage] = useState<number>(initialPage);

  // URL 쿼리 파라미터 동기화 (필터 및 뷰 모드 변경 시)
  useEffect(() => {
    const params = new URLSearchParams();
    if (viewMode !== 'infinite') params.set('mode', viewMode);
    if (speciesFilter !== 'ALL') params.set('species', speciesFilter);
    if (genderFilter !== 'ALL') params.set('gender', genderFilter);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (viewMode === 'pagination' && page > 0) params.set('page', String(page));

    setSearchParams(params, { replace: true });
  }, [viewMode, speciesFilter, genderFilter, searchQuery, page, setSearchParams]);

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
    [speciesFilter],
  );

  // 4. No-Offset 커서 기반 고속 무한 스크롤 훅 적용
  const {
    items: infiniteAnimals,
    isLoading: isInfiniteLoading,
    isFetchingMore,
    hasNext,
    targetRef,
    refresh: refreshInfinite,
    error: infiniteError,
  } = useCursorScroll<Animal>({
    resourceKey: 'animals',
    fetcher: cursorFetcher,
    getId: (item) => item.id ?? item.animalId ?? '',
    pageSize: 9,
    enabled: viewMode === 'infinite' && genderFilter === 'ALL' && !debouncedSearchQuery.trim(),
    dependencies: [speciesFilter],
  });

  const needsCompleteFilterSet = genderFilter !== 'ALL' || debouncedSearchQuery.trim() !== '';
  const pageQuery = useAnimalListQuery(
    page,
    6,
    speciesFilter,
    viewMode === 'pagination' && !needsCompleteFilterSet,
  );
  const filterQuery = useAllAnimalsQuery(needsCompleteFilterSet, speciesFilter);
  const allFilterCandidates = filterQuery.data || [];
  const paginationAnimals = pageQuery.data?.content || [];
  const totalPages = pageQuery.data?.totalPages || 1;
  const isFilterLoading = needsCompleteFilterSet && filterQuery.isLoading;
  const isPaginationLoading = pageQuery.isLoading;
  const loadError = needsCompleteFilterSet
    ? filterQuery.error
    : viewMode === 'pagination'
      ? pageQuery.error
      : infiniteError
        ? new Error(infiniteError)
        : null;

  // 6. 클라이언트 레벨 검색어 & 성별 필터링
  const rawList = needsCompleteFilterSet
    ? allFilterCandidates
    : viewMode === 'infinite'
      ? infiniteAnimals
      : paginationAnimals;
  const filteredAnimals = useAnimalFilters(rawList, genderFilter, debouncedSearchQuery);

  const displayedAnimals =
    viewMode === 'pagination' && needsCompleteFilterSet
      ? filteredAnimals.slice(page * 6, (page + 1) * 6)
      : filteredAnimals;
  const displayedTotalPages = needsCompleteFilterSet
    ? Math.max(1, Math.ceil(filteredAnimals.length / 6))
    : totalPages;

  const isLoading = needsCompleteFilterSet
    ? isFilterLoading
    : viewMode === 'infinite'
      ? isInfiniteLoading
      : isPaginationLoading;
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

  const onRetry = () => {
    if (needsCompleteFilterSet) void filterQuery.refetch();
    else if (viewMode === 'infinite') void refreshInfinite();
    else void pageQuery.refetch();
  };

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
        onSearchChange={(query) => {
          setSearchQuery(query);
          setPage(0);
        }}
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
        <AnimalListResults
          loadError={loadError}
          isLoading={isLoading}
          viewMode={viewMode}
          displayedAnimals={displayedAnimals}
          handleResetFilters={handleResetFilters}
          onRetry={onRetry}
        />
        {/* 1. 페이지네이션 뷰 하단 번호 이동 */}
        <AnimalListPaginationView
          viewMode={viewMode}
          isLoading={isLoading}
          displayedAnimals={displayedAnimals}
          page={page}
          displayedTotalPages={displayedTotalPages}
          setPage={setPage}
        />
        {/* 2. 무한 스크롤 뷰 하단 센서 & 상태 UI */}
        <AnimalListInfiniteView
          viewMode={viewMode}
          targetRef={targetRef}
          isFetchingMore={isFetchingMore}
          hasNext={hasNext}
          isLoading={isLoading}
          displayedAnimals={displayedAnimals}
        />
      </div>
    </div>
  );
};

export default AnimalList;
