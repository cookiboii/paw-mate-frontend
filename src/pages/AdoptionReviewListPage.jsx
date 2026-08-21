import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from '../styles/AdoptionReviewListPage.module.css';
import axios from '../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';

// 카테고리 접두사 파싱
export const CATEGORIES = [
  { key: 'ALL',    label: '전체',         emoji: '📋' },
  { key: 'REVIEW', label: '입양 후기',     emoji: '💌' },
  { key: 'REPORT', label: '유기동물 제보', emoji: '🚨' },
];

export const CATEGORY_PREFIX = {
  REVIEW: '[입양후기]',
  REPORT: '[유기동물제보]',
};

export function getCategoryFromTitle(title = '') {
  if (title.startsWith(CATEGORY_PREFIX.REVIEW)) return 'REVIEW';
  if (title.startsWith(CATEGORY_PREFIX.REPORT)) return 'REPORT';
  return 'REVIEW'; // 기본값
}

export function getCleanTitle(title = '') {
  return title
    .replace(CATEGORY_PREFIX.REVIEW, '')
    .replace(CATEGORY_PREFIX.REPORT, '')
    .trim();
}

const AdoptionReviewListPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const observer = useRef();

  const lastReviewElementRef = useCallback((node) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && page < totalPages - 1) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, page, totalPages]);

  // 카테고리 변경 시 초기화
  useEffect(() => {
    setReviews([]);
    setPage(0);
    setTotalPages(1);
  }, [activeCategory]);

  useEffect(() => {
    fetchReviews(page);
  }, [page, activeCategory]);

  const fetchReviews = async (pageNum) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/post/list?page=${pageNum}&size=9&sort=id,desc`);
      const allReviews = res.data.result?.content ?? res.data?.content ?? [];

      // 카테고리 필터링 (프론트에서 제목 prefix 기반으로 분류)
      const filtered = activeCategory === 'ALL'
        ? allReviews
        : allReviews.filter(r => getCategoryFromTitle(r.title) === activeCategory);

      if (pageNum === 0) {
        setReviews(filtered);
      } else {
        setReviews((prev) => {
          const existingIds = new Set(prev.map(r => r.id));
          return [...prev, ...filtered.filter(r => !existingIds.has(r.id))];
        });
      }
      setTotalPages(res.data.result?.totalPages ?? res.data?.totalPages ?? 1);
    } catch (err) {
      console.error('게시글 불러오기 실패', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSkeletons = (count) =>
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
        <p>입양 후기와 유기동물 제보를 공유하는 공간입니다.</p>
      </div>

      {/* 카테고리 탭 */}
      <div className={styles.tabBar}>
        {CATEGORIES.map(({ key, label, emoji }) => (
          <button
            key={key}
            className={`${styles.tabBtn} ${activeCategory === key ? styles.activeTab : ''}`}
            onClick={() => setActiveCategory(key)}
          >
            <span className={styles.tabEmoji}>{emoji}</span>
            {label}
          </button>
        ))}

        {isAuthenticated && (
          <button
            className={styles.writeBtn}
            onClick={() => navigate('/review')}
          >
            ✏️ 글쓰기
          </button>
        )}
      </div>

      {/* 게시글 그리드 */}
      <div className={styles.grid}>
        {reviews.length > 0 ? (
          reviews.map((review, index) => {
            const isLast = reviews.length === index + 1;
            const cat = getCategoryFromTitle(review.title);
            const cleanTitle = getCleanTitle(review.title);
            const catInfo = CATEGORIES.find(c => c.key === cat) || CATEGORIES[1];

            return (
              <Link
                ref={isLast ? lastReviewElementRef : null}
                to={`/reviews/${review.id}`}
                key={review.id}
                className={styles.card}
              >
                <div className={styles.imageWrapper}>
                  {review.img ? (
                    <img src={review.img} alt={cleanTitle} className={styles.thumbnail} loading="lazy" />
                  ) : (
                    <div className={`${styles.noImagePlaceholder} ${cat === 'REPORT' ? styles.reportPlaceholder : ''}`}>
                      <span>{cat === 'REPORT' ? '🚨' : '💌'}</span>
                      <p>{catInfo.label}</p>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <div className={`${styles.categoryBadge} ${cat === 'REPORT' ? styles.badgeReport : styles.badgeReview}`}>
                    {catInfo.emoji} {catInfo.label}
                  </div>
                  <h3>{cleanTitle}</h3>
                  <p>{review.content?.slice(0, 65) ?? '내용 없음'}...</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.authorName}>✍️ {review.name || '익명'}</span>
                    {review.createdAt && (
                      <span className={styles.cardDate}>
                        {new Date(review.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : !isLoading ? (
          <div className={styles.emptyState}>
            <span>{activeCategory === 'REPORT' ? '🚨' : '🐾'}</span>
            <p>
              {activeCategory === 'REPORT'
                ? '아직 유기동물 제보 글이 없습니다.'
                : activeCategory === 'REVIEW'
                ? '아직 작성된 입양 후기가 없습니다.'
                : '아직 작성된 글이 없습니다.'}
            </p>
            {isAuthenticated && (
              <button className={styles.emptyWriteBtn} onClick={() => navigate('/review')}>
                첫 글을 작성해보세요 →
              </button>
            )}
          </div>
        ) : null}

        {isLoading && renderSkeletons(page === 0 ? 9 : 3)}
      </div>
    </div>
  );
};

export default AdoptionReviewListPage;
