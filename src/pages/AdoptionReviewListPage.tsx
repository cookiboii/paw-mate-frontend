import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import styles from '../styles/pages/AdoptionReviewListPage.module.css';
import { getReviewsCursor, getReviews, prefetchReviewById } from '../api/review';
import { Link, useSearchParams } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import ImageWithFallback from '../components/ImageWithFallback';
import ReviewCategoryTabs, { CATEGORIES } from '../components/ReviewCategoryTabs';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';
import usePageTitle from '../hooks/usePageTitle';
import { useCursorScroll } from '../hooks/useCursorScroll';
import { ReviewItem, ReviewSort } from '../types/review';
import { HeartHandshake, Gift, AlertTriangle, User, PawPrint, Heart, MessageCircle } from 'lucide-react';
import { getCategoryFromTitle, getCleanTitle } from '../utils/reviewCategory';
import useDebounce from '../hooks/useDebounce';

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
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. 카테고리 URL 쿼리 파라미터 동기화
  const rawCategory = searchParams.get('category');
  const validCategory = ['ALL', 'REVIEW', 'FREE_ADOPTION', 'REPORT'].includes(rawCategory || '')
    ? (rawCategory as string)
    : 'ALL';

  const [activeCategory, setActiveCategory] = useState<string>(validCategory);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const debouncedKeyword = useDebounce(searchKeyword.trim(), 300);
  const rawSort = searchParams.get('sort');
  const sort: ReviewSort = rawSort === 'popular' || rawSort === 'comments' ? rawSort : 'latest';

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['ALL', 'REVIEW', 'FREE_ADOPTION', 'REPORT'].includes(cat)) {
      setActiveCategory(cat);
    } else if (!cat) {
      setActiveCategory('ALL');
    }
  }, [searchParams]);

  const handleCategoryChange = useCallback(
    (key: string) => {
      setActiveCategory(key);
      const newParams = new URLSearchParams(searchParams);
      if (key === 'ALL') {
        newParams.delete('category');
      } else {
        newParams.set('category', key);
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleSortChange = useCallback((nextSort: ReviewSort) => {
    const newParams = new URLSearchParams(searchParams);
    if (nextSort === 'latest') newParams.delete('sort');
    else newParams.set('sort', nextSort);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // 2. 커서 기반 게시글 페칭 콜백 (오프셋 폴백 내장)
  const cursorFetcher = useCallback(
    async (lastId: string | number | undefined, pageSize: number) => {
      try {
        // 백엔드의 category/search 규격이 배포되기 전까지는 전체 목록을 받아
        // 아래 displayedReviews에서 호환성 있게 분류한다.
        return await getReviewsCursor(lastId, pageSize);
      } catch (err) {
        // 서버 내부 오류는 다른 목록 경로에서도 동일하게 발생하므로 중복 요청하지 않는다.
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status !== 404 && status !== 405) throw err;
        console.warn('커서 페이징 에러, 오프셋 페이징 폴백 실행:', err);
        const pageData = await getReviews(0, pageSize, 'id,desc');
        return {
          content: pageData.content || [],
          hasNext: false,
          isLast: true,
          size: pageSize,
          number: 0,
        };
      }
    },
    []
  );

  // 3. No-Offset 커서 기반 고속 무한 스크롤 훅 적용
  const {
    items: reviews,
    isLoading,
    isFetchingMore,
    hasNext,
    lastId: lastPostId,
    targetRef,
    fetchNext,
  } = useCursorScroll<ReviewItem>({
    fetcher: cursorFetcher,
    getId: (item) => Number(item.id),
    pageSize: 12,
    dependencies: [],
  });

  // 4. 클라이언트 카테고리 및 검색어 필터링
  // 백엔드 검색 API 배포 전에도 카테고리/검색이 동작하도록 한 번 더 필터링한다.
  // 백엔드가 같은 조건을 처리하는 경우에도 결과에는 영향이 없다.
  const displayedReviews = useMemo(() => {
    let list = reviews;

    if (activeCategory !== 'ALL') {
      list = list.filter((review) => getCategoryFromTitle(review.title) === activeCategory);
    }

    if (debouncedKeyword) {
      const keyword = debouncedKeyword.toLowerCase();
      list = list.filter((review) => {
        const title = getCleanTitle(review.title).toLowerCase();
        const content = (review.content || '').toLowerCase();
        const author = (review.name || '').toLowerCase();
        return title.includes(keyword) || content.includes(keyword) || author.includes(keyword);
      });
    }

    return [...list].sort((a, b) => {
      if (sort === 'popular') return (b.likeCount ?? 0) - (a.likeCount ?? 0);
      if (sort === 'comments') return (b.commentCount ?? 0) - (a.commentCount ?? 0);
      return Number(b.id) - Number(a.id);
    });
  }, [reviews, activeCategory, debouncedKeyword, sort]);

  // 카테고리 선택 시 화면 아이템 수가 적으면 백그라운드에서 다음 데이터 자동 로드
  useEffect(() => {
    if (activeCategory !== 'ALL' && displayedReviews.length < 6 && hasNext && !isLoading && lastPostId !== undefined) {
      fetchNext();
    }
  }, [activeCategory, displayedReviews.length, hasNext, isLoading, lastPostId, fetchNext]);

  const renderSkeletons = (count: number) =>
    Array.from({ length: count }).map((_, idx) => (
      <div key={`skeleton-${idx}`} className={styles.card}>
        <Skeleton type="image" height="220px" width="100%" />
        <div className={styles.skeletonContent}>
          <Skeleton type="text" height="22px" width="70%" />
          <Skeleton type="text" height="16px" width="100%" />
        </div>
      </div>
    ));

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.pageHeader}>
        <h2>커뮤니티</h2>
        <p>입양 후기, 무료 분양 및 유기동물 제보를 공유하는 따뜻한 공간입니다.</p>
      </header>

      {/* 카테고리 탭, 검색바 및 글쓰기 버튼 컴포넌트 */}
      <ReviewCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        sort={sort}
        onSortChange={handleSortChange}
        isAuthenticated={isAuthenticated}
      />

      {/* 게시글 그리드 */}
      <div className={styles.grid}>
        {displayedReviews.length > 0 ? (
          displayedReviews.map((review, index) => {
            const cat = getCategoryFromTitle(review.title);
            const cleanTitle = getCleanTitle(review.title);
            const catInfo = CATEGORIES.find((c) => c.key === cat) || CATEGORIES[1];

            return (
              <Link
                key={review.id}
                to={`/reviews/${review.id}`}
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
                      <span>
                        {renderCategoryIcon(cat, 32)}
                      </span>
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
                  >
                    {renderCategoryIcon(cat, 13)}
                    <span>{catInfo.label}</span>
                  </div>
                  <h3>{cleanTitle}</h3>
                  <p>{review.content?.slice(0, 65) ?? '내용 없음'}...</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.authorName}>
                      <User size={13} /> {review.name || '익명'}
                    </span>
                    {(review.createdAt || review.createAt) && (
                      <span className={styles.cardDate}>작성일 {formatDate(review.createdAt || review.createAt)}</span>
                    )}
                  </div>
                  <div className={styles.cardStats} aria-label="게시글 반응">
                    <span><Heart size={14} /> {review.likeCount ?? 0}</span>
                    <span><MessageCircle size={14} /> {review.commentCount ?? 0}</span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : !isLoading ? (
          <div className={styles.emptyState}>
            <span>
              {renderCategoryIcon(activeCategory, 44)}
            </span>
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

        {/* 첫 로딩 스켈레톤 */}
        {isLoading && renderSkeletons(lastPostId === undefined ? 9 : 3)}
      </div>

      {/* 무한 스크롤 관찰 센서 타겟 */}
      <div ref={targetRef} className={styles.scrollSentinel} />

      {/* 추가 페칭 로딩 스피너 */}
      {isFetchingMore && (
        <div className={styles.fetchingMore}>
          <span>이야기를 더 불러오는 중...</span>
        </div>
      )}

      {/* 무한 스크롤 종단 UI */}
      {!isLoading && displayedReviews.length > 0 && !hasNext && (
        <div className={styles.endOfList}>
          <div className={styles.endOfListDivider} />
          <p>
            <span>모든 이야기를 다 불러왔습니다</span>
            <PawPrint size={14} />
          </p>
        </div>
      )}
    </div>
  );
};

export default AdoptionReviewListPage;
