import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import styles from '../styles/AdoptionReviewDetail.module.css';
import CommentSection from '../components/CommentSection';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate } from '../utils/date';
import { getCategoryFromTitle, getCleanTitle, CATEGORIES } from './AdoptionReviewListPage';

const AdoptionReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [review, setReview] = useState(null);
  const [currentUser, setCurrentUser] = useState({ email: '', role: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);
    try {
      await axios.delete(`/post/${id}`);
      setIsDeleteModalOpen(false);
      showToast('게시글이 성공적으로 삭제되었습니다.', 'success');
      // 토스트가 보일 시간을 주고 이동
      setTimeout(() => navigate('/reviews'), 800);
    } catch (err) {
      showToast('삭제에 실패했습니다. 다시 시도해주세요.', 'error');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoaded || !review) return <div className={styles.loadingWrapper}><Spinner /></div>;

  const isAuthor = currentUser.email === review.email;
  const isAdmin = currentUser.role === 'ADMIN';

  const cat = getCategoryFromTitle(review.title);
  const cleanTitle = getCleanTitle(review.title);
  const catInfo = CATEGORIES.find(c => c.key === cat) || CATEGORIES[1];
  const isReport = cat === 'REPORT';

  return (
    <div className={styles.pageWrapper}>
      <article className={styles.article}>
        {/* Hero Section */}
        <div className={`${styles.heroSection} ${!review.img ? (isReport ? styles.heroNoImgReport : styles.heroNoImg) : ''}`}>
          {review.img ? (
            <img src={review.img} alt={cleanTitle} className={styles.heroImage} />
          ) : (
            <div className={`${styles.noImage} ${isReport ? styles.noImageReport : ''}`}>
              <span style={{ fontSize: '4rem' }}>{catInfo.emoji}</span>
              <p>{catInfo.label}</p>
            </div>
          )}
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              {/* 카테고리 뱃지 */}
              <span className={`${styles.heroCategoryBadge} ${isReport ? styles.heroBadgeReport : styles.heroBadgeReview}`}>
                {catInfo.emoji} {catInfo.label}
              </span>
              <h1 className={styles.title}>{cleanTitle}</h1>
              <div className={styles.meta}>
                <span className={styles.author}>
                  <div className={styles.avatar}>{review.name?.charAt(0) || 'U'}</div>
                  {review.name}
                </span>
                {review.createAt && (
                  <span className={styles.dateText}>
                    {formatDate(review.createAt, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          {(isAuthor || isAdmin) && (
            <div className={styles.actions}>
              {isAuthor && (
                <button className={styles.editBtn} onClick={() => navigate(`/reviews/${id}/edit`)}>
                  수정
                </button>
              )}
              <button
                className={styles.deleteBtn}
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          )}

          {/* 유기동물 제보 긴급 안내 */}
          {isReport && (
            <div className={styles.reportBanner}>
              <strong>🚨 이 글은 유기동물 제보 게시글입니다</strong>
              <p>도움이 필요하신 분은 <strong>동물보호 상담전화 1577-0954</strong>로 연락해 주세요.</p>
            </div>
          )}

          <div className={styles.bodyText}>
            {review.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          {/* 목록으로 버튼 */}
          <button className={styles.backBtn} onClick={() => navigate('/reviews')}>
            ← 목록으로
          </button>
        </div>
      </article>

      <div className={styles.commentWrapper}>
        <CommentSection postId={id} />
      </div>

      {/* 커스텀 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="게시글 삭제"
        message="정말 이 글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
        confirmText={isDeleting ? '삭제 중...' : '삭제하기'}
        cancelText="취소"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default AdoptionReviewDetail;
