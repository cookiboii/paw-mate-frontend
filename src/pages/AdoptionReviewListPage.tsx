import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import styles from '../styles/AdoptionReviewListPage.module.css';
import { getReviews } from '../api/review';
import { Link, useNavigate } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';
import usePageTitle from '../hooks/usePageTitle';
import { ReviewItem } from '../types/review';
import { LayoutGrid, HeartHandshake, Gift, AlertTriangle, PenSquare, User, PawPrint, Search, X } from 'lucide-react';

export interface CategoryOption {
  key: string;
  label: string;
  icon: React.ReactNode;
}

// 카테고리 접두사 파싱
export const CATEGORIES: CategoryOption[] = [
  { key: 'ALL', label: '전체', icon: <LayoutGrid size={16} /> },
  { key: 'REVIEW', label: '입양 후기', icon: <HeartHandshake size={16} /> },
  { key: 'FREE_ADOPTION', label: '무료 분양', icon: <Gift size={16} /> },
  { key: 'REPORT', label: '유기동물 제보', icon: <AlertTriangle size={16} /> },
];

export const CATEGORY_PREFIX: Record<string, string> = {
  REVIEW: '[입양후기]',
  FREE_ADOPTION: '[무료분양]',
  REPORT: '[유기동물제보]',
};

export function getCategoryFromTitle(title = ''): string {
  if (title.startsWith(CATEGORY_PREFIX.REVIEW)) return 'REVIEW';
  if (title.startsWith(CATEGORY_PREFIX.FREE_ADOPTION)) return 'FREE_ADOPTION';
  if (title.startsWith(CATEGORY_PREFIX.REPORT)) return 'REPORT';
  return 'REVIEW'; // 기본값
}

export function getCleanTitle(title = ''): string {
  return title
    .replace(CATEGORY_PREFIX.REVIEW, '')
    .replace(CATEGORY_PREFIX.FREE_ADOPTION, '')
    .replace(CATEGORY_PREFIX.REPORT, '')
    .trim();
}

const renderCategoryIcon = (cat: string, size = 16) => {
  switch (cat) {
    case 'REPORT':
      return <AlertTriangle size={size} />;
    case 'FREE_ADOPTION':
      return <Gift size={size} />;
    case 'REVIEW':
    default:
      return <HeartHandshake size={size} />;
  }
};

const AdoptionReviewListPage: React.FC = () => {
  usePageTitle('따뜻한 입양 후기 & 제보');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  const lastReviewElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && page < totalPages - 1) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, page, totalPages]
  );

  // 카테고리 변경 시 초기화
  useEffect(() => {
    setReviews([]);
    setPage(0);
    setTotalPages(1);
  }, [activeCategory]);

  const fetchReviews = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const data = await getReviews(pageNum, 9, 'id,desc');
      const allReviews: ReviewItem[] = data.result?.content ?? data.content ?? [];

      // 카테고리 필터링 (프론트에서 제목 prefix 기반으로 분류)
      const filtered =
        activeCategory === 'ALL'
          ? allReviews
          : allReviews.filter((r) => getCategoryFromTitle(r.title) === activeCategory);

      if (pageNum === 0) {
        setReviews(filtered);
      } else {
        setReviews((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          return [...prev, ...filtered.filter((r) => !existingIds.has(r.id))];
        });
      }
      setTotalPages(data.result?.totalPages ?? data.totalPages ?? 1);
    } catch (err) {
      console.error('게시글 불러오기 실패', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page, activeCategory]);

  // 검색어 필터링
  const displayedReviews = useMemo(() => {
    if (!searchKeyword.trim()) return reviews;
    const kw = searchKeyword.toLowerCase().trim();
    return reviews.filter((r) => {
      const title = getCleanTitle(r.title).toLowerCase();
      const content = (r.content || '').toLowerCase();
      const author = (r.name || '').toLowerCase();
      return title.includes(kw) || content.includes(kw) || author.includes(kw);
    });
  }, [reviews, searchKeyword]);

  const renderSkeletons = (count: number) =>
    Array.from({ length: count }).map((_, idx) => (
      <div key={`skeleton-${idx}`} className={styles.card}>
        <Skeleton type="image" height="220px" width="100%" />
        <div style={{ padding: '20px' }}>
          <Skeleton type="text" height="22px" width="70%" />
          <Skeleton type="text" height="16px" width="100%" />
        </div>
      </div>
    ));

  return (
    <div className={styles.container}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <h2>커뮤니티</h2>
        <p>입양 후기, 무료 분양 및 유기동물 제보를 공유하는 따뜻한 공간입니다.</p>
      </div>

      {/* 검색 & 카테고리 컨트롤 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '440px', width: '100%' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="제목, 내용, 작성자 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 38px 10px 40px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-color)',
              color: 'var(--text-primary)',
              fontSize: '0.92rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)'
            }}
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              aria-label="검색어 지우기"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 카테고리 탭 */}
        <div className={styles.tabBar}>
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`${styles.tabBtn} ${activeCategory === key ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory(key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span className={styles.tabEmoji} style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}

          {isAuthenticated && (
            <button className={styles.writeBtn} onClick={() => navigate('/review')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <PenSquare size={16} />
              <span>글쓰기</span>
            </button>
          )}
        </div>
      </div>

      {/* 게시글 그리드 */}
      <div className={styles.grid}>
        {displayedReviews.length > 0 ? (
          displayedReviews.map((review, index) => {
            const isLast = displayedReviews.length === index + 1;
            const cat = getCategoryFromTitle(review.title);
            const cleanTitle = getCleanTitle(review.title);
            const catInfo = CATEGORIES.find((c) => c.key === cat) || CATEGORIES[1];

            return (
              <Link
                ref={isLast ? lastReviewElementRef : null}
                to={`/reviews/${review.id}`}
                key={review.id}
                className={styles.card}
              >
                <div className={styles.imageWrapper}>
                  {review.img ? (
                    <img
                      src={review.img}
                      alt={cleanTitle}
                      className={styles.thumbnail}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className={`${styles.noImagePlaceholder} ${
                        cat === 'REPORT'
                          ? styles.reportPlaceholder
                          : cat === 'FREE_ADOPTION'
                          ? styles.freeAdoptionPlaceholder
                          : ''
                      }`}
                    >
                      <span style={{ display: 'flex', justifyContent: 'center' }}>{renderCategoryIcon(cat, 32)}</span>
                      <p>{catInfo.label}</p>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <div
                    className={`${styles.categoryBadge} ${
                      cat === 'REPORT'
                        ? styles.badgeReport
                        : cat === 'FREE_ADOPTION'
                        ? styles.badgeFreeAdoption
                        : styles.badgeReview
                    }`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {renderCategoryIcon(cat, 13)}
                    <span>{catInfo.label}</span>
                  </div>
                  <h3>{cleanTitle}</h3>
                  <p>{review.content?.slice(0, 65) ?? '내용 없음'}...</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.authorName} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} /> {review.name || '익명'}
                    </span>
                    {(review.createdAt || review.createAt) && (
                      <span className={styles.cardDate}>
                        {formatDate(review.createdAt || review.createAt)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : !isLoading ? (
          <div className={styles.emptyState}>
            <span style={{ display: 'flex', justifyContent: 'center' }}>{renderCategoryIcon(activeCategory, 44)}</span>
            <p>
              {searchKeyword
                ? `'${searchKeyword}'에 대한 검색 결과가 없습니다.`
                : activeCategory === 'REPORT'
                ? '아직 유기동물 제보 글이 없습니다.'
                : activeCategory === 'FREE_ADOPTION'
                ? '아직 등록된 무료 분양 글이 없습니다.'
                : activeCategory === 'REVIEW'
                ? '아직 작성된 입양 후기가 없습니다.'
                : '아직 작성된 글이 없습니다.'}
            </p>
          </div>
        ) : null}

        {isLoading && renderSkeletons(page === 0 ? 9 : 3)}

        {/* 무한 스크롤 종단 UI */}
        {!isLoading && displayedReviews.length > 0 && page >= totalPages - 1 && (
          <div className={styles.endOfList}>
            <div className={styles.endOfListDivider} />
            <p style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>모든 이야기를 다 불러왔습니다</span>
              <PawPrint size={14} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdoptionReviewListPage;

