import { useState, useEffect, useRef, useCallback } from 'react';
import { SliceResponse } from '../types/common';
import { getErrorMessage } from '../utils/error';

export interface UseCursorScrollOptions<T> {
  /** No-Offset 커서 기반 API 호출 함수 (lastId, pageSize 전달) */
  fetcher: (lastId: string | number | undefined, pageSize: number) => Promise<SliceResponse<T>>;
  /** 각 아이템의 고유 식별자 추출 함수 (중복 렌더링 방지용) */
  getId: (item: T) => string | number;
  /** 한 번에 가져올 페이지 크기 (기본값: 10) */
  pageSize?: number;
  /** 활성화 여부 (특정 조건에서 페칭을 멈출 때 false) */
  enabled?: boolean;
  /** 변경 시 커서를 초기화하고 새로 페칭할 의존성 배열 */
  dependencies?: unknown[];
}

export interface UseCursorScrollReturn<T> {
  /** 누적된 데이터 목록 */
  items: T[];
  /** 아이템 수동 조작용 세터 */
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  /** 첫 페이지 로딩 중 여부 */
  isLoading: boolean;
  /** 다음 커서 페이지 추가 로딩 중 여부 */
  isFetchingMore: boolean;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
  /** 에러 메시지 (없으면 null) */
  error: string | null;
  /** 마지막으로 페칭된 아이템의 ID */
  lastId: string | number | undefined;
  /** 무한 스크롤 감지용 센서 엘리먼트에 바인딩할 ref 콜백 */
  targetRef: (node: HTMLElement | null) => void;
  /** 데이터 새로고침 (처음부터 다시 조회) */
  refresh: () => Promise<void>;
  /** 수동 다음 페이지 로드 */
  fetchNext: () => Promise<void>;
}

/**
 * ⚡ No-Offset 커서 기반 고속 무한 스크롤 커스텀 훅
 * - IntersectionObserver 자동 바인딩 및 해제
 * - Clustered Index PK 기반 lastId 자동 추적
 * - 중복 ID 데이터 원천 필터링
 * - 의존성 변경 시 커서 자동 리셋 및 재페칭
 */
export function useCursorScroll<T>({
  fetcher,
  getId,
  pageSize = 10,
  enabled = true,
  dependencies = [],
}: UseCursorScrollOptions<T>): UseCursorScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | number | undefined>(undefined);

  // 최신 상태 유지를 위한 Ref (클로저 트랩 방지)
  const isFetchingRef = useRef(false);
  const hasNextRef = useRef(true);
  const lastIdRef = useRef<string | number | undefined>(undefined);
  const observerRef = useRef<IntersectionObserver | null>(null);

  hasNextRef.current = hasNext;
  lastIdRef.current = lastId;

  // 1. 초기 데이터 로드 함수
  const loadInitial = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);
    setHasNext(true);
    setLastId(undefined);
    lastIdRef.current = undefined;
    hasNextRef.current = true;

    try {
      const sliceData = await fetcher(undefined, pageSize);
      const content = sliceData.content || [];
      setItems(content);

      const nextAvailable = sliceData.hasNext ?? content.length >= pageSize;
      setHasNext(nextAvailable);
      hasNextRef.current = nextAvailable;

      if (content.length > 0) {
        const lastItem = content[content.length - 1];
        const newLastId = getId(lastItem);
        setLastId(newLastId);
        lastIdRef.current = newLastId;
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      console.error('[useCursorScroll] 초기 데이터 페칭 실패:', msg);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fetcher, getId, pageSize]);

  // 2. 다음 페이지 로드 함수
  const fetchNext = useCallback(async () => {
    if (
      !enabled ||
      isFetchingRef.current ||
      !hasNextRef.current ||
      lastIdRef.current === undefined
    ) {
      return;
    }

    isFetchingRef.current = true;
    setIsFetchingMore(true);

    try {
      const sliceData = await fetcher(lastIdRef.current, pageSize);
      const newItems = sliceData.content || [];

      if (newItems.length > 0) {
        setItems((prev) => {
          const existingIds = new Set(prev.map(getId));
          const uniqueNew = newItems.filter((item) => !existingIds.has(getId(item)));
          return [...prev, ...uniqueNew];
        });

        const lastItem = newItems[newItems.length - 1];
        const newLastId = getId(lastItem);
        setLastId(newLastId);
        lastIdRef.current = newLastId;

        const nextAvailable = sliceData.hasNext ?? newItems.length >= pageSize;
        setHasNext(nextAvailable);
        hasNextRef.current = nextAvailable;
      } else {
        setHasNext(false);
        hasNextRef.current = false;
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      console.error('[useCursorScroll] 다음 페이지 페칭 실패:', msg);
      setHasNext(false);
      hasNextRef.current = false;
    } finally {
      isFetchingRef.current = false;
      setIsFetchingMore(false);
    }
  }, [enabled, fetcher, getId, pageSize]);

  // 3. 의존성 변경 시 초기화
  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencies]);

  // 4. IntersectionObserver 타겟 바인딩 콜백
  const targetRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || !enabled) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextRef.current && !isFetchingRef.current) {
            fetchNext();
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
      );

      observerRef.current.observe(node);
    },
    [enabled, fetchNext]
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  return {
    items,
    setItems,
    isLoading,
    isFetchingMore,
    hasNext,
    error,
    lastId,
    targetRef,
    refresh: loadInitial,
    fetchNext,
  };
}
