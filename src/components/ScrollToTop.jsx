import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 📜 라우트 이동 시 페이지 스크롤을 최상단(0, 0)으로 즉시 리셋하는 컴포넌트
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
