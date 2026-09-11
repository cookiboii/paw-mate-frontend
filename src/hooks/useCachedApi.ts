// src/hooks/useCachedApi.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache } from '../utils/apiCache';

interface UseCachedApiOptions<T> {
  ttl?: number;
  enabled?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

interface UseCachedApiResult<T> {
  data: T | null;
  isLoading: boolean;
  isRevalidating: boolean;
  error: Error | null;
  refetch: (force?: boolean) => Promise<T | null>;
  mutate: (newData: T, shouldRevalidate?: boolean) => void;
}

/**
 * ⚡ SWR(Stale-While-Revalidate) 패턴 기반의 고성능 API 캐싱 훅
 */
export function useCachedApi<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseCachedApiOptions<T> = {}
): UseCachedApiResult<T> {
  const { ttl, enabled = true, initialData, onSuccess, onError } = options;

  const initialCached = key ? apiCache.get<T>(key) : null;
  const [data, setData] = useState<T | null>(initialCached ?? initialData ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCached && !initialData && enabled && !!key);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const activeKeyRef = useRef(key);
  activeKeyRef.current = key;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const executeFetch = useCallback(
    async (force = false): Promise<T | null> => {
      if (!key || !enabled) return null;
      const requestKey = key;

      const cached = apiCache.get<T>(key);
      if (cached && !force) {
        if (activeKeyRef.current === requestKey) {
          setData(cached);
          setIsLoading(false);
        }
        return cached;
      }

      if (cached) {
        if (activeKeyRef.current === requestKey) setIsRevalidating(true);
      } else {
        if (activeKeyRef.current === requestKey) setIsLoading(true);
      }
      if (activeKeyRef.current === requestKey) setError(null);

      try {
        const result = await apiCache.fetchWithCache(key, () => fetcherRef.current(), {
          ttl,
          force,
        });
        if (activeKeyRef.current === requestKey) setData(result);
        if (activeKeyRef.current === requestKey && onSuccessRef.current) {
          onSuccessRef.current(result);
        }
        return result;
      } catch (err: unknown) {
        const errObj = err instanceof Error ? err : new Error(String(err));
        if (activeKeyRef.current === requestKey) setError(errObj);
        if (activeKeyRef.current === requestKey && onErrorRef.current) {
          onErrorRef.current(errObj);
        }
        return null;
      } finally {
        if (activeKeyRef.current === requestKey) {
          setIsLoading(false);
          setIsRevalidating(false);
        }
      }
    },
    [key, enabled, ttl]
  );

  useEffect(() => {
    if (key && enabled) {
      const cached = apiCache.get<T>(key);
      if (cached) {
        setData(cached);
        setIsLoading(false);
      } else {
        setData(initialData ?? null);
        setError(null);
        executeFetch(false);
      }
    }
  }, [key, enabled, executeFetch]);

  const mutate = useCallback(
    (newData: T, shouldRevalidate = false) => {
      if (!key) return;
      apiCache.set(key, newData, ttl);
      setData(newData);
      if (shouldRevalidate) {
        executeFetch(true);
      }
    },
    [key, ttl, executeFetch]
  );

  return {
    data,
    isLoading,
    isRevalidating,
    error,
    refetch: executeFetch,
    mutate,
  };
}

export default useCachedApi;
