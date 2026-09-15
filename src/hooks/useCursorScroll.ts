import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SliceResponse } from '../types/common';
import { getErrorMessage } from '../utils/error';

export interface UseCursorScrollOptions<T> {
  fetcher: (lastId: string | number | undefined, pageSize: number) => Promise<SliceResponse<T>>;
  getId: (item: T) => string | number;
  pageSize?: number;
  enabled?: boolean;
  dependencies?: unknown[];
}

export interface UseCursorScrollReturn<T> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  isLoading: boolean;
  isFetchingMore: boolean;
  hasNext: boolean;
  error: string | null;
  lastId: string | number | undefined;
  targetRef: (node: HTMLElement | null) => void;
  refresh: () => Promise<void>;
  fetchNext: () => Promise<void>;
}

/** React Query-backed cursor pagination, retaining the existing component API. */
export function useCursorScroll<T>({ fetcher, getId, pageSize = 10, enabled = true, dependencies = [] }: UseCursorScrollOptions<T>): UseCursorScrollReturn<T> {
  const [localItems, setLocalItems] = useState<T[] | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const query = useInfiniteQuery({
    queryKey: ['cursor-scroll', pageSize, ...dependencies],
    queryFn: ({ pageParam }) => fetcherRef.current(pageParam ?? undefined, pageSize),
    initialPageParam: null as string | number | null,
    enabled,
    getNextPageParam: (lastPage) => {
      const content = lastPage.content || [];
      return lastPage.hasNext && content.length ? getId(content[content.length - 1]) : undefined;
    },
  });

  useEffect(() => setLocalItems(null), [query.data]);

  const fetchedItems = useMemo(() => {
    const seen = new Set<string>();
    return (query.data?.pages.flatMap((page) => page.content || []) || []).filter((item) => {
      const id = String(getId(item));
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [getId, query.data]);
  const items = localItems ?? fetchedItems;
  const lastId = items.length ? getId(items[items.length - 1]) : undefined;

  const fetchNext = useCallback(async () => {
    if (query.hasNextPage && !query.isFetchingNextPage) await query.fetchNextPage();
  }, [query]);
  const refresh = useCallback(async () => { await query.refetch(); }, [query]);

  const targetRef = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    if (!node || !enabled) return;
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void fetchNext();
    }, { threshold: 0.1, rootMargin: '100px' });
    observerRef.current.observe(node);
  }, [enabled, fetchNext]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return {
    items,
    setItems: (value) => setLocalItems((previous) => typeof value === 'function' ? (value as (items: T[]) => T[])(previous ?? fetchedItems) : value),
    isLoading: query.isLoading,
    isFetchingMore: query.isFetchingNextPage,
    hasNext: Boolean(query.hasNextPage),
    error: query.error ? getErrorMessage(query.error) : null,
    lastId,
    targetRef,
    refresh,
    fetchNext,
  };
}
