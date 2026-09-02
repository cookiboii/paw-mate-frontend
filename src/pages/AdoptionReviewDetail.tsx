import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReviewById, deleteReview } from '../api/review';
import { getMyInfo } from '../api/user';
import { apiCache } from '../utils/apiCache';
import styles from '../styles/AdoptionReviewDetail.module.css';
import CommentSection from '../components/CommentSection';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';
import { formatDate } from '../utils/date';
import usePageTitle from '../hooks/usePageTitle';
import { getCategoryFromTitle, getCleanTitle, CATEGORIES } from './AdoptionReviewListPage';
import { ReviewDetailData } from '../types/review';
import { AlertTriangle, Gift, HeartHandshake, ArrowLeft, Edit3, Trash2, Share2, Check } from 'lucide-react';

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

const AdoptionReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const initialCached = id ? apiCache.get<ReviewDetailData>(`review:detail:${id}`) : null;
  const [review, setReview] = useState<ReviewDetailData | null>(initialCached);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string }>({ email: '', role: '' });
  const [isLoaded, setIsLoaded] = useState<boolean>(!!initialCached);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);


  const cleanTitle = review ? getCleanTitle(review.title) : '';
  usePageTitle(cleanTitle || '후기 상세');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [reviewData, userData] = await Promise.all([
          getReviewById(id).catch(() => null),
          getMyInfo().catch(() => null),
        ]);

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
        console.error('데이터 조회 실패:', err);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteReview(id);
      setIsDeleteModalOpen(false);
      showToast('게시글이 성공적으로 삭제되었습니다.', 'success');
      setTimeout(() => navigate('/reviews'), 800);
    } catch (err) {
      showToast('삭제에 실패했습니다. 다시 시도해주세요.', 'error');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `[파우메이트] ${cleanTitle}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: review?.content ? review.content.slice(0, 80) + '...' : cleanTitle,
          url: shareUrl,
        });
        return;
      } catch {
        // 공유 취소
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      showToast('게시글 링크가 클립보드에 복사되었습니다!', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      showToast('링크 복사에 실패했습니다.', 'error');
    }
  };

  if (!isLoaded || !review) {
    return (
      <div className={styles.pageWrapper}>
        <article className={styles.article}>
          <Skeleton type="image" height={320} />
          <div className={styles.contentSection}>
            <Skeleton type="title" width="70%" height={32} style={{ marginBottom: '16px' }} />
            <Skeleton type="text" width="40%" height={20} style={{ marginBottom: '24px' }} />
            <Skeleton type="text" height={18} style={{ marginBottom: '8px' }} />
            <Skeleton type="text" height={18} style={{ marginBottom: '8px' }} />
            <Skeleton type="text" width="80%" height={18} />
          </div>
        </article>
      </div>
    );
  }

  const isAuthor = currentUser.email === review.email;
  const isAdmin = currentUser.role === 'ADMIN';

  const cat = getCategoryFromTitle(review.title);
  const catInfo = CATEGORIES.find((c) => c.key === cat) || CATEGORIES[1];
  const isReport = cat === 'REPORT';
  const isFreeAdoption = cat === 'FREE_ADOPTION';

  return (
    <div className={styles.pageWrapper}>
      <article className={styles.article}>
        {/* Hero Section */}
        <div
          className={`${styles.heroSection} ${
            !review.img
              ? isReport
                ? styles.heroNoImgReport
                : isFreeAdoption
                ? styles.heroNoImgFreeAdoption
                : styles.heroNoImg
              : ''
          }`}
        >
          {review.img ? (
            <img src={review.img} alt={cleanTitle} className={styles.heroImage} />
          ) : (
            <div
              className={`${styles.noImage} ${
                isReport
                  ? styles.noImageReport
                  : isFreeAdoption
                  ? styles.noImageFreeAdoption
                  : ''
              }`}
            >
              <span style={{ display: 'flex', justifyContent: 'center' }}>{renderCategoryIcon(cat, 56)}</span>
              <p>{catInfo.label}</p>
            </div>
          )}
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              {/* 카테고리 뱃지 */}
              <span
                className={`${styles.heroCategoryBadge} ${
                  isReport
                    ? styles.heroBadgeReport
                    : isFreeAdoption
                    ? styles.heroBadgeFreeAdoption
                    : styles.heroBadgeReview
                }`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {renderCategoryIcon(cat, 14)}
                <span>{catInfo.label}</span>
              </span>
              <h1 className={styles.title}>{cleanTitle}</h1>
              <div className={styles.meta}>
                <span className={styles.author}>
                  <div className={styles.avatar}>{review.name?.charAt(0) || 'U'}</div>
                  {review.name}
                </span>
                {(review.createAt || review.createdAt) && (
                  <span className={styles.dateText}>
                    {formatDate(review.createAt || review.createdAt, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'var(--surface-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 500,
                transition: 'all var(--transition-fast)'
              }}
              title="링크 복사 및 공유하기"
            >
              {isCopied ? (
                <>
                  <Check size={15} color="var(--primary-color)" />
                  <span style={{ color: 'var(--primary-color)' }}>링크 복사됨</span>
                </>
              ) : (
                <>
                  <Share2 size={15} />
                  <span>공유하기</span>
                </>
              )}
            </button>

            {(isAuthor || isAdmin) && (
              <div className={styles.actions} style={{ margin: 0 }}>
                {isAuthor && (
                  <button className={styles.editBtn} onClick={() => navigate(`/reviews/${id}/edit`)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Edit3 size={15} />
                    <span>수정</span>
                  </button>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={15} />
                  <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 유기동물 제보 긴급 안내 */}
          {isReport && (
            <div className={styles.reportBanner}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#e63946" />
                <span>이 글은 유기동물 제보 게시글입니다</span>
              </strong>
              <p>도움이 필요하신 분은 <strong>동물보호 상담전화 1577-0954</strong>로 연락해 주세요.</p>
            </div>
          )}

          {/* 무료 분양 안내 */}
          {isFreeAdoption && (
            <div className={styles.freeAdoptionBanner}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={18} color="#4361ee" />
                <span>무료 분양 안내</span>
              </strong>
              <p>반려동물 입양은 소중한 생명을 평생 책임지는 약속입니다. 안전한 입양을 위해 직접 만나 아이의 상태를 확인하고 교감해 보세요.</p>
            </div>
          )}

          <div className={styles.bodyText}>
            {review.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          {/* 목록으로 버튼 */}
          <button className={styles.backBtn} onClick={() => navigate('/reviews')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} />
            <span>목록으로</span>
          </button>
        </div>
      </article>

      <div className={styles.commentWrapper}>
        <CommentSection postId={id || ''} />
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
