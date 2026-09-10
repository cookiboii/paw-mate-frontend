import React from 'react';
import { LayoutGrid, HeartHandshake, Gift, AlertTriangle, PenSquare, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../styles/pages/AdoptionReviewListPage.module.css';
import { REVIEW_CATEGORY_PREFIX } from '../utils/reviewCategory';

export interface CategoryOption {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export const CATEGORIES: CategoryOption[] = [
  { key: 'ALL', label: '전체', icon: <LayoutGrid size={16} /> },
  { key: 'REVIEW', label: '입양 후기', icon: <HeartHandshake size={16} /> },
  { key: 'FREE_ADOPTION', label: '무료 분양', icon: <Gift size={16} /> },
  { key: 'REPORT', label: '유기동물 제보', icon: <AlertTriangle size={16} /> },
];

export const CATEGORY_PREFIX = REVIEW_CATEGORY_PREFIX;

export interface ReviewCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  isAuthenticated: boolean;
}

/**
 * 💌 커뮤니티 카테고리 탭, 검색 인풋 및 글쓰기 액션 바
 */
const ReviewCategoryTabs: React.FC<ReviewCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
  searchKeyword,
  onSearchChange,
  isAuthenticated,
}) => {
  return (
    <div className={styles.controlsWrapper}>
      {/* 검색 바 */}
      <div className={styles.searchBox}>
        <span
          className={styles.searchIcon}
          aria-hidden="true"
        >
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="제목, 내용, 작성자 검색..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="게시글 검색"
          className={styles.searchInput}
        />
        {searchKeyword && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="검색어 지우기"
            className={styles.searchClearBtn}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 카테고리 탭 & 글쓰기 버튼 */}
      <div className={styles.tabBar} role="tablist" aria-label="게시판 카테고리">
        {CATEGORIES.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeCategory === tab.key}
            className={`${styles.tabBtn} ${activeCategory === tab.key ? styles.activeTab : ''}`}
            onClick={() => onCategoryChange(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}

        <Link
          to={isAuthenticated ? '/reviews/write' : '/login'}
          className={styles.writeBtn}
        >
          <PenSquare size={16} />
          <span>글쓰기</span>
        </Link>
      </div>
    </div>
  );
};

export default React.memo(ReviewCategoryTabs);
