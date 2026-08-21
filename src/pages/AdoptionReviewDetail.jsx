import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import styles from '../styles/AdoptionReviewDetail.module.css';
import CommentSection from '../components/CommentSection';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const AdoptionReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [review, setReview] = useState(null);
  const [currentUser, setCurrentUser] = useState({ email: '', role: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, userRes] = await Promise.all([
          axios.get(`/post/${id}`).catch(() => null),
          axios.get('/adoptmate/myInfo').catch(() => null),
        ]);

        const reviewData = reviewRes?.data?.result || reviewRes?.data;
        const userData = userRes?.data?.result || userRes?.data;

        if (reviewData) {
          setReview({
            ...reviewData,
            email: (reviewData.email || '').trim().toLowerCase(),
          });
        }

        if (userData) {
          setCurrentUser({
            email: (userData?.email || '').trim().toLowerCase(),
            role: (userData?.role || '').trim().toUpperCase(),
          });
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('❌ 데이터 조회 실패:', err);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    // Custom confirm via toast, but since toast is just notification,
    // we use a nice standard confirm for now (or a custom modal if we had one).
    // Let's stick to standard confirm but use toast for the result.
    if (window.confirm('정말 이 후기를 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.')) {
      try {
        await axios.delete(`/post/${id}`);
        showToast('후기가 성공적으로 삭제되었습니다.', 'success');
        navigate('/reviews');
      } catch (err) {
        showToast('삭제에 실패했습니다. 다시 시도해주세요.', 'error');
        console.error(err);
      }
    }
  };

  if (!isLoaded || !review) return <div className={styles.loadingWrapper}><Spinner /></div>;

  const isAuthor = currentUser.email === review.email;
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className={styles.pageWrapper}>
      <article className={styles.article}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          {review.img ? (
            <img src={review.img} alt={review.title} className={styles.heroImage} />
          ) : (
            <div className={styles.noImage}>이미지가 없습니다</div>
          )}
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <h1 className={styles.title}>{review.title}</h1>
              <div className={styles.meta}>
                <span className={styles.author}>
                  <div className={styles.avatar}>{review.name?.charAt(0) || 'U'}</div>
                  {review.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          {(isAuthor || isAdmin) && (
            <div className={styles.actions}>
              {isAuthor && (
                <button 
                  className={styles.editBtn} 
                  onClick={() => navigate(`/reviews/${id}/edit`)}
                >
                  수정
                </button>
              )}
              <button 
                className={styles.deleteBtn} 
                onClick={handleDelete}
              >
                삭제
              </button>
            </div>
          )}
          
          <div className={styles.bodyText}>
            {review.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </article>

      <div className={styles.commentWrapper}>
        <CommentSection postId={id} />
      </div>
    </div>
  );
};

export default AdoptionReviewDetail;
