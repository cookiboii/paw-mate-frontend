import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

export const apiQueryKey = (key: string) => ['legacy-api', key] as const;

/**
 * Compatibility wrapper for the legacy cache hook.
 * New and existing call sites share TanStack Query's cache without a UI rewrite.
 */
export function useCachedApi<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseCachedApiOptions<T> = {}
): UseCachedApiResult<T> {
  const { ttl = 3 * 60 * 1000, enabled = true, initialData, onSuccess, onError } = options;
  const queryClient = useQueryClient();
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const queryKey = apiQueryKey(key ?? 'disabled');
  const query = useQuery({
    queryKey,
    queryFn: () => fetcherRef.current(),
    enabled: Boolean(key) && enabled,
    staleTime: ttl,
    initialData,
  });

  useEffect(() => {
    if (query.data !== undefined) onSuccessRef.current?.(query.data);
  }, [query.data]);

  useEffect(() => {
    if (query.error) {
      const error = query.error instanceof Error ? query.error : new Error(String(query.error));
      onErrorRef.current?.(error);
    }
  }, [query.error]);

  const refetch = useCallback(async (_force = false) => {
    const result = await query.refetch();
    return result.data ?? null;
  }, [query]);

  const mutate = useCallback((newData: T, shouldRevalidate = false) => {
    queryClient.setQueryData(queryKey, newData);
    if (shouldRevalidate) queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isRevalidating: query.isFetching && !query.isLoading,
    error: query.error instanceof Error ? query.error : query.error ? new Error(String(query.error)) : null,
    refetch,
    mutate,
  };
}

export default useCachedApi;
