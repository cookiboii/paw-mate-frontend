import React from 'react';
import styles from '../styles/Pagination.module.css';

interface PaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  if (totalPages <= 1) return null;

  // 페이지 번호 생성 로직 (1-based index로 계산 후 0-based로 이벤트 발산)
  const current = currentPage + 1;

  const generatePageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3; // current + siblings + first + last
    const totalBlocks = totalNumbers + 2; // + 2 for ellipses

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(current - siblingCount, 1);
    const rightSiblingIndex = Math.min(current + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, '...', ...middleRange, '...', totalPages];
    }

    return [];
  };

  const pages = generatePageNumbers();

  return (
    <nav className={styles.paginationWrapper} aria-label="페이지 네비게이션">
      <button
        type="button"
        className={`${styles.pageBtn} ${styles.navBtn}`}
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        aria-label="이전 페이지로 이동"
      >
        &larr; 이전
      </button>

      {pages.map((page, idx) => {
        if (page === '...') {
          return (
            <span key={`dots-${idx}`} className={styles.ellipsis}>
              …
            </span>
          );
        }

        const pageNum = Number(page);
        const isActive = pageNum === current;

        return (
          <button
            key={`page-${pageNum}`}
            type="button"
            className={`${styles.pageBtn} ${isActive ? styles.activePage : ''}`}
            onClick={() => onPageChange(pageNum - 1)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`${pageNum} 페이지로 이동`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        type="button"
        className={`${styles.pageBtn} ${styles.navBtn}`}
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage >= totalPages - 1}
        aria-label="다음 페이지로 이동"
      >
        다음 &rarr;
      </button>
    </nav>
  );
};

export default React.memo(Pagination);
