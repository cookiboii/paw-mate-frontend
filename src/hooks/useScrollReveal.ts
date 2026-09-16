import { useEffect, useRef, RefObject } from 'react';

const DEFAULT_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px',
};

export const useScrollReveal = <T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverInit = DEFAULT_OPTIONS,
): RefObject<T | null> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    }, options);

    if (element) {
      element.classList.add('reveal-hidden');
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, options.root]);

  return ref;
};

export default useScrollReveal;
