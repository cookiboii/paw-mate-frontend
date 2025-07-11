import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import styles from '../styles/AdoptionReviewDetail.module.css';

const AdoptionReviewDetail = () => {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [currentUser, setCurrentUser] = useState({ email: '', role: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, userRes] = await Promise.all([
          axios.get(`/post/${id}`),
          axios.get('/adoptmate/myInfo'),
        ]);

        const reviewData = reviewRes.data.result;
        const userData = userRes.data;

        // 로그 1: API 응답 원본 출력
        console.log('📦 리뷰 응답 원본:', reviewData);
        console.log('👤 사용자 응답 원본:', userData);

        // 이메일, 역할 정제 및 저장
        if (reviewData) {
          setReview({
            ...reviewData,
            email: (reviewData.email || '').trim().toLowerCase(),
          });
        }

        setCurrentUser({
          email: (userData?.email || '').trim().toLowerCase(),
          role: (userData?.role || '').trim().toUpperCase(),
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('❌ 데이터 조회 실패:', err);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/post/${id}`);
        alert('삭제되었습니다.');
        navigate('/reviews');
      } catch (err) {
        alert('삭제 실패');
        console.error(err);
      }
    }
  };

  if (!isLoaded || !review) return <div>로딩 중...</div>;

  // 비교 로직
  const isAuthor = currentUser.email === review.email;
  const isAdmin = currentUser.role === 'ADMIN';

  // 로그 2: 비교 결과 출력
  console.log('🟡 비교 디버깅 --------------------------');
  console.log(`✅ 사용자 이메일: "${currentUser.email}"`);
  console.log(`✅ 작성자 이메일: "${review.email}"`);
  console.log(`✅ 사용자 역할: "${currentUser.role}"`);
  console.log('📌 isAuthor 평가 결과:', isAuthor);
  console.log('📌 isAdmin 평가 결과:', isAdmin);
  console.log('----------------------------------------');

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{review.title}</h2>
      <p className={styles.author}>작성자: {review.name}</p>
      <img src={review.img} alt={review.title} className={styles.image} />
      <div className={styles.content}>{review.content}</div>

      {(isAuthor || isAdmin) && (
        <div className={styles.actions}>
          {isAuthor && <button onClick={() => navigate(`/reviews/${id}/edit`)}>수정</button>}
          <button onClick={handleDelete}>삭제</button>
        </div>
      )}
    </div>
  );
};

export default AdoptionReviewDetail;
