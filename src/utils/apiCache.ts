// src/utils/apiCache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();
  private defaultTTL = 3 * 60 * 1000; // 3분

  /**
   * 캐시 데이터 조회 (만료된 경우 null 반환)
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 캐시 데이터 저장
   */
  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 유효한 캐시가 존재하는지 여부 확인
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 특정 키의 캐시 삭제
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.inFlight.delete(key);
  }

  /**
   * 접두사(prefix)로 시작하는 모든 캐시 무효화 (예: 'animal:', 'review:')
   */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 전체 캐시 비우기
   */
  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  /**
   * ⚡ 캐시 우선 조회 + 네트워크 요청 중복 방지 (Stale-While-Revalidate 및 Deduplication)
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; force?: boolean } = {}
  ): Promise<T> {
    const { ttl = this.defaultTTL, force = false } = options;

    if (!force) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // 이미 동일한 키로 네트워크 요청이 진행 중이면 해당 Promise를 공유 (요청 중복 방지)
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    const promise = fetcher()
      .then((data) => {
        this.set(key, data, ttl);
        this.inFlight.delete(key);
        return data;
      })
      .catch((error) => {
        this.inFlight.delete(key);
        throw error;
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * 🚀 백그라운드 프리페치 (사용자가 호버했을 때 미리 네트워크 호출)
   */
  prefetch<T>(key: string, fetcher: () => Promise<T>, ttl = this.defaultTTL): void {
    if (this.has(key) || this.inFlight.has(key)) {
      return;
    }
    // 백그라운드에서 조용히 실행 및 캐싱
    this.fetchWithCache(key, fetcher, { ttl }).catch(() => {
      // 프리페치 실패는 조용히 무시
    });
  }
}

export const apiCache = new ApiCache();
export default apiCache;
