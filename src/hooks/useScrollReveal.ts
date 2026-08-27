import { useEffect, useRef, RefObject } from 'react';

export const useScrollReveal = <T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
): RefObject<T | null> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) {
      ref.current.classList.add('reveal-hidden');
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return ref;
};

export default useScrollReveal;
