import React, { useEffect, useState } from 'react';
import styles from '../styles/AdoptionReviewListPage.module.css';
import axios from '../api/axiosInstance';
import { Link } from 'react-router-dom';

const AdoptionReviewListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const fetchReviews = async (pageNum) => {
    try {
      const res = await axios.get(`/post/list?page=${pageNum}&size=6`);
      console.log('📦 후기 응답:', res.data);
      setReviews(res.data.result?.content ?? []);
      setTotalPages(res.data.result?.totalPages ?? 1);
    } catch (err) {
      console.error('입양 후기 불러오기 실패', err);
      setReviews([]);
    }
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <div className={styles.container}>
      <h2>입양 후기 목록</h2>
      <div className={styles.grid}>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Link to={`/reviews/${review.id}`} key={review.id} className={styles.card}>
              <img
                src={review.img}
                alt={review.title}
                className={styles.thumbnail}
              />
              <h3>{review.title}</h3>
              <p>{review.content?.slice(0, 60) ?? '내용 없음'}...</p>
            </Link>
          ))
        ) : (
          <p>후기가 없습니다.</p>
        )}
      </div>

      <div className={styles.pagination}>
        <button onClick={handlePrev} disabled={page === 0}>이전</button>
        <span>{page + 1} / {totalPages}</span>
        <button onClick={handleNext} disabled={page >= totalPages - 1}>다음</button>
      </div>
    </div>
  );
};

export default AdoptionReviewListPage;
