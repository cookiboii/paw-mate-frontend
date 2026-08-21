import { useEffect } from 'react';

/**
 * 🏷️ 페이지별 브라우저 탭 타이틀(document.title)을 변경하는 커스텀 훅
 * @param {string} title - 페이지별 타이틀 (예: '동물 목록')
 * @param {boolean} withSuffix - ' | AdoptMate' 접미사 포함 여부 (기본값: true)
 */
export const usePageTitle = (title, withSuffix = true) => {
  useEffect(() => {
    const prevTitle = document.title;
    const fullTitle = title 
      ? (withSuffix ? `${title} | AdoptMate` : title)
      : 'AdoptMate | 사지 말고 입양하세요 🐾';

    document.title = fullTitle;

    return () => {
      document.title = prevTitle;
    };
  }, [title, withSuffix]);
};

export default usePageTitle;
