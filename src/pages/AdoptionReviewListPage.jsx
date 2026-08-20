import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from '../styles/AdoptionReviewListPage.module.css';
import axios from '../api/axiosInstance';
import { Link } from 'react-router-dom';

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
          // Remove duplicates just in case
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

  return (
    <div className={styles.container}>
      <h2>입양 후기 목록</h2>
      <div className={styles.grid}>
        {reviews.length > 0 ? (
          reviews.map((review, index) => {
            if (reviews.length === index + 1) {
              return (
                <Link ref={lastReviewElementRef} to={`/reviews/${review.id}`} key={review.id} className={styles.card}>
                  <img src={review.img} alt={review.title} className={styles.thumbnail} />
                  <h3>{review.title}</h3>
                  <p>{review.content?.slice(0, 60) ?? '내용 없음'}...</p>
                </Link>
              );
            } else {
              return (
                <Link to={`/reviews/${review.id}`} key={review.id} className={styles.card}>
                  <img src={review.img} alt={review.title} className={styles.thumbnail} />
                  <h3>{review.title}</h3>
                  <p>{review.content?.slice(0, 60) ?? '내용 없음'}...</p>
                </Link>
              );
            }
          })
        ) : !isLoading ? (
          <p>후기가 없습니다.</p>
        ) : null}
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          불러오는 중...
        </div>
      )}
    </div>
  );
};

export default AdoptionReviewListPage;
