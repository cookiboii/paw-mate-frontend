import React from 'react';
import { LayoutGrid, HeartHandshake, Gift, AlertTriangle, PenSquare, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../styles/pages/AdoptionReviewListPage.module.css';

export interface CategoryOption {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export const CATEGORIES: CategoryOption[] = [
  { key: 'ALL', label: '?�체', icon: <LayoutGrid size={16} /> },
  { key: 'REVIEW', label: '?�양 ?�기', icon: <HeartHandshake size={16} /> },
  { key: 'FREE_ADOPTION', label: '무료 분양', icon: <Gift size={16} /> },
  { key: 'REPORT', label: '?�기?�물 ?�보', icon: <AlertTriangle size={16} /> },
];

export const CATEGORY_PREFIX: Record<string, string> = {
  REVIEW: '[?�양?�기]',
  FREE_ADOPTION: '[무료분양]',
  REPORT: '[?�기?�물?�보]',
};

export interface ReviewCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  isAuthenticated: boolean;
}

/**
 * ?�� 커�??�티 카테고리 ?? 검???�풋 �?글?�기 ?�션 �? */
const ReviewCategoryTabs: React.FC<ReviewCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
  searchKeyword,
  onSearchChange,
  isAuthenticated,
}) => {
  return (
    <div className={styles.controlsWrapper}>
      {/* 검??�?*/}
      <div className={styles.searchBox}>
        <span
          className={styles.searchIcon}
          aria-hidden="true"
        >
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="?�목, ?�용, ?�성??검??.."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="게시글 검??
          className={styles.searchInput}
        />
        {searchKeyword && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="검?�어 지?�기"
            className={styles.searchClearBtn}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 카테고리 ??& 글?�기 버튼 */}
      <div className={styles.tabBar} role="tablist" aria-label="게시??카테고리">
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
          <span>글?�기</span>
        </Link>
      </div>
    </div>
  );
};

export default React.memo(ReviewCategoryTabs);
