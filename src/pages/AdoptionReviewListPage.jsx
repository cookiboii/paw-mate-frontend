import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from '../styles/AdoptionReviewListPage.module.css';
import axios from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import Skeleton from '../components/Skeleton';

const AdoptionReviewListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const fetchReviews = async (pageNum) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/post/list?page=${pageNum}&size=6`);
      console.log('📦 후기 응답:', res.data);
      const newReviews = res.data.result?.content ?? [];
      
      if (pageNum === 0) {
        setReviews(newReviews);
      } else {
        setReviews((prev) => {
          const existingIds = new Set(prev.map(r => r.id));
          const filteredNew = newReviews.filter(r => !existingIds.has(r.id));
          return [...prev, ...filteredNew];
        });
      }
      setTotalPages(res.data.result?.totalPages ?? 1);
    } catch (err) {
      console.error('입양 후기 불러오기 실패', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSkeletons = (count) => {
    return Array.from({ length: count }).map((_, idx) => (
      <div key={`skeleton-${idx}`} className={styles.card}>
        <Skeleton type="image" height="240px" width="100%" />
        <div style={{ padding: '24px' }}>
          <Skeleton type="text" height="24px" width="70%" />
          <Skeleton type="text" height="16px" width="100%" />
          <Skeleton type="text" height="16px" width="80%" />
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.container}>
      <h2>입양 후기 목록</h2>
      <div className={styles.grid}>
        {reviews.length > 0 ? (
          reviews.map((review, index) => {
            const isLast = reviews.length === index + 1;
            return (
              <Link 
                ref={isLast ? lastReviewElementRef : null} 
                to={`/reviews/${review.id}`} 
                key={review.id} 
                className={styles.card}
              >
                <div className={styles.imageWrapper}>
                  <img src={review.img} alt={review.title} className={styles.thumbnail} loading="lazy" />
                </div>
                <div className={styles.cardContent}>
                  <h3>{review.title}</h3>
                  <p>{review.content?.slice(0, 60) ?? '내용 없음'}...</p>
                </div>
              </Link>
            );
          })
        ) : !isLoading ? (
          <div className={styles.emptyState}>
            <span>🐾</span>
            <p>아직 작성된 후기가 없습니다.</p>
          </div>
        ) : null}

        {/* 로딩 중일 때 스켈레톤 UI 표시 */}
        {isLoading && renderSkeletons(page === 0 ? 6 : 3)}
      </div>
    </div>
  );
};

export default AdoptionReviewListPage;
