import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import styles from '../styles/AdoptionReviewListPage.module.css';
import { getReviewsCursor, getReviews, prefetchReviewById } from '../api/review';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import ImageWithFallback from '../components/ImageWithFallback';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';
import usePageTitle from '../hooks/usePageTitle';
import { ReviewItem, PostResponseDto } from '../types/review';
import { SliceResponse, PageResponse } from '../types/common';
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
  const t = (title || '').trim();
  if (/^\[(유기동물제보|유기동물\s*제보|제보)\]/i.test(t)) return 'REPORT';
  if (/^\[(무료분양|무료\s*분양|분양)\]/i.test(t)) return 'FREE_ADOPTION';
  if (/^\[(입양후기|입양\s*후기|후기)\]/i.test(t)) return 'REVIEW';
  return 'REVIEW'; // 기본값
}

export function getCleanTitle(title = ''): string {
  return (title || '')
    .replace(/^\[(입양후기|입양\s*후기|후기|무료분양|무료\s*분양|분양|유기동물제보|유기동물\s*제보|제보)\]\s*/i, '')
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
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get('category');
  const validCategory = ['ALL', 'REVIEW', 'FREE_ADOPTION', 'REPORT'].includes(rawCategory || '')
    ? (rawCategory as string)
    : 'ALL';

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [lastPostId, setLastPostId] = useState<number | undefined>(undefined);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>(validCategory);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  // URL 파라미터 변경 시 activeCategory 동기화
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['ALL', 'REVIEW', 'FREE_ADOPTION', 'REPORT'].includes(cat)) {
      setActiveCategory(cat);
    } else if (!cat) {
      setActiveCategory('ALL');
    }
  }, [searchParams]);

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    const newParams = new URLSearchParams(searchParams);
    if (key === 'ALL') {
      newParams.delete('category');
    } else {
      newParams.set('category', key);
    }
    setSearchParams(newParams, { replace: true });
  };

  const fetchNextReviews = async (isReset = false, currentLastId?: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // ⚡ No-Offset 커서 기반 고속 페이징 API 호출
      const res = await getReviewsCursor(isReset ? undefined : currentLastId, 12);
      const sliceData = 'result' in res && res.result ? res.result : (res as SliceResponse<PostResponseDto>);
      const rawContent = (sliceData.content || []) as unknown as ReviewItem[];
      const nextHasNext = sliceData.hasNext !== undefined ? sliceData.hasNext : (!sliceData.isLast && rawContent.length > 0);

      if (isReset) {
        setReviews(rawContent);
      } else {
        setReviews((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          return [...prev, ...rawContent.filter((r) => !existingIds.has(r.id))];
        });
      }

      setHasNext(Boolean(nextHasNext && rawContent.length > 0));
      if (rawContent.length > 0) {
        const lastItem = rawContent[rawContent.length - 1];
        setLastPostId(Number(lastItem.id));
      }
    } catch (err) {
      console.warn('커서 페이징 실패, 기존 페이징으로 폴백 시도:', err);
      try {
        const fallbackRes = await getReviews(0, 12, 'id,desc');
        const pageData = 'result' in fallbackRes && fallbackRes.result ? fallbackRes.result : (fallbackRes as PageResponse<PostResponseDto>);
        const fallbackContent = (pageData.content || []) as unknown as ReviewItem[];
        setReviews(fallbackContent);
        setHasNext(false);
      } catch (fallbackErr) {
        console.error('게시글 불러오기 실패:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const lastReviewElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNext) {
          fetchNextReviews(false, lastPostId);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNext, lastPostId]
  );

  // 초기 첫 페이지 로드
  useEffect(() => {
    fetchNextReviews(true);
  }, []);

  // 카테고리 및 검색어 필터링
  const displayedReviews = useMemo(() => {
    let list = reviews;

    // 1. 카테고리 필터링
    if (activeCategory !== 'ALL') {
      list = list.filter((r) => getCategoryFromTitle(r.title) === activeCategory);
    }

    // 2. 검색어 필터링
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase().trim();
      list = list.filter((r) => {
        const title = getCleanTitle(r.title).toLowerCase();
        const content = (r.content || '').toLowerCase();
        const author = (r.name || '').toLowerCase();
        return title.includes(kw) || content.includes(kw) || author.includes(kw);
      });
    }

    return list;
  }, [reviews, activeCategory, searchKeyword]);

  // 선택된 카테고리의 글 개수가 적고 더 불러올 데이터가 있다면 자동으로 추가 로드
  useEffect(() => {
    if (activeCategory !== 'ALL' && displayedReviews.length < 6 && hasNext && !isLoading && lastPostId !== undefined) {
      fetchNextReviews(false, lastPostId);
    }
  }, [activeCategory, displayedReviews.length, hasNext, isLoading, lastPostId]);

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
              onClick={() => handleCategoryChange(key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span className={styles.tabEmoji} style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}

          {isAuthenticated && (
            <button
              className={styles.writeBtn}
              onClick={() => navigate(activeCategory !== 'ALL' ? `/review?category=${activeCategory}` : '/review')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
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
                onMouseEnter={() => prefetchReviewById(review.id)}
              >
                <div className={styles.imageWrapper}>
                  {review.img ? (
                    <ImageWithFallback
                      src={review.img}
                      alt={cleanTitle}
                      className={styles.thumbnail}
                      aspectRatio="16/9"
                      fetchPriority={index < 3 ? 'high' : 'auto'}
                      fallbackText={catInfo.label}
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

        {isLoading && renderSkeletons(lastPostId === undefined ? 9 : 3)}

        {/* 무한 스크롤 종단 UI */}
        {!isLoading && displayedReviews.length > 0 && !hasNext && (
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

