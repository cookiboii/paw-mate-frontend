import { useEffect, useRef } from 'react';

const useScrollReveal = (options = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // observer.unobserve(entry.target); // Optional: Stop observing once revealed
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
