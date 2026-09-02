// src/hooks/useCachedApi.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache } from '../utils/apiCache';

interface UseCachedApiOptions<T> {
  ttl?: number;
  enabled?: boolean;
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
  const { ttl, enabled = true, onSuccess, onError } = options;

  const initialCached = key ? apiCache.get<T>(key) : null;
  const [data, setData] = useState<T | null>(initialCached);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCached && enabled && !!key);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const executeFetch = useCallback(
    async (force = false): Promise<T | null> => {
      if (!key || !enabled) return null;

      const cached = apiCache.get<T>(key);
      if (cached && !force) {
        setData(cached);
        setIsLoading(false);
        return cached;
      }

      if (cached) {
        setIsRevalidating(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await apiCache.fetchWithCache(key, () => fetcherRef.current(), {
          ttl,
          force,
        });
        setData(result);
        if (onSuccessRef.current) {
          onSuccessRef.current(result);
        }
        return result;
      } catch (err: unknown) {
        const errObj = err instanceof Error ? err : new Error(String(err));
        setError(errObj);
        if (onErrorRef.current) {
          onErrorRef.current(errObj);
        }
        return null;
      } finally {
        setIsLoading(false);
        setIsRevalidating(false);
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
