import { useState, useEffect } from 'react';

/**
 * 값이 변경될 때 지정된 delay(ms) 동안 대기한 후 최종 값을 반환하는 커스텀 훅
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
