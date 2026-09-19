import ReviewDetailContent from '../components/reviews/ReviewDetailContent';
import ReviewReactionActions from '../components/reviews/ReviewReactionActions';
import ReviewDetailHero from '../components/reviews/ReviewDetailHero';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReviewById, deleteReview, setReviewBookmark, setReviewLike } from '../api/review';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/pages/AdoptionReviewDetail.module.css';
import CommentSection from '../components/CommentSection';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';

import usePageTitle from '../hooks/usePageTitle';
import {
  useReviewDetailQuery,
  useDeleteReviewMutation,
  useReviewLikeMutation,
  useReviewBookmarkMutation,
} from '../hooks/queries/reviews';
import useShare from '../hooks/useShare';
import { getErrorMessage } from '../utils/error';
import { CATEGORIES } from '../components/ReviewCategoryTabs';
import { getCategoryFromTitle, getCleanTitle } from '../utils/reviewCategory';
import { ReviewDetailData, PostResponseDto } from '../types/review';
import { ArrowLeft, Edit3, Trash2, Share2, Check } from 'lucide-react';
import ImageLightboxModal from '../components/ImageLightboxModal';

const AdoptionReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    data: rawReview,
    isLoading: isReviewLoading,
    error: reviewError,
    refetch,
  } = useReviewDetailQuery(id);
  const deleteMutation = useDeleteReviewMutation();
  const likeMutation = useReviewLikeMutation();
  const bookmarkMutation = useReviewBookmarkMutation();

  const review: ReviewDetailData | null = rawReview ?? null;

  const { isAuthenticated, isAdmin: hasAdminRole } = useAuth();
  const isAdmin = isAuthenticated && hasAdminRole;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isReactionLoading, setIsReactionLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLiked(Boolean(review?.likedByMe));
    setLikeCount(review?.likeCount ?? 0);
    setIsBookmarked(Boolean(review?.bookmarkedByMe));
  }, [review?.id, review?.likedByMe, review?.likeCount, review?.bookmarkedByMe]);

  const cleanTitle = review ? getCleanTitle(review.title) : '';
  usePageTitle(cleanTitle || '후기 상세');

  const isLoaded = !isReviewLoading && !!review;

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(id);
      setIsDeleteModalOpen(false);
      showToast('게시글이 성공적으로 삭제되었습니다.', 'success');
      setTimeout(() => navigate('/reviews'), 800);
    } catch (err: unknown) {
      showToast('삭제 실패: ' + getErrorMessage(err), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const { isCopied, handleShare } = useShare({
    title: `[AdoptMate] ${cleanTitle}`,
    text: review?.content ? review.content.slice(0, 80) + '...' : cleanTitle,
    successMessage: '게시글 링크가 클립보드에 복사되었습니다!',
  });

  const requireLoginForReaction = () => {
    if (isAuthenticated) return true;
    showToast('좋아요와 북마크는 로그인 후 이용할 수 있습니다.', 'info');
    navigate('/login');
    return false;
  };

  const handleLike = async () => {
    if (!id || !requireLoginForReaction() || isReactionLoading) return;
    setIsReactionLoading(true);
    try {
      const result = await likeMutation.mutateAsync({ id, value: !isLiked });
      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (err) {
      showToast(getErrorMessage(err, '좋아요를 변경하지 못했습니다.'), 'error');
    } finally {
      setIsReactionLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!id || !requireLoginForReaction() || isReactionLoading) return;
    setIsReactionLoading(true);
    try {
      const result = await bookmarkMutation.mutateAsync({ id, value: !isBookmarked });
      setIsBookmarked(result.bookmarked);
      showToast(result.bookmarked ? '북마크에 저장했습니다.' : '북마크를 해제했습니다.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, '북마크를 변경하지 못했습니다.'), 'error');
    } finally {
      setIsReactionLoading(false);
    }
  };

  if (reviewError && !review) {
    return (
      <div role="alert">
        게시글을 불러오지 못했습니다. <button onClick={() => void refetch()}>다시 시도</button>
      </div>
    );
  }
  if (!isLoaded || !review) {
    return (
      <div className={styles.pageWrapper}>
        <article className={styles.article}>
          <Skeleton type="image" height={320} />
          <div className={styles.contentSection}>
            <Skeleton type="title" width="70%" height={32} className={styles.skeletonTitle} />
            <Skeleton type="text" width="40%" height={20} className={styles.skeletonSubtitle} />
            <Skeleton type="text" height={18} className={styles.skeletonLine} />
            <Skeleton type="text" height={18} className={styles.skeletonLine} />
            <Skeleton type="text" width="80%" height={18} />
          </div>
        </article>
      </div>
    );
  }

  const cat = getCategoryFromTitle(review.title);
  const catInfo = CATEGORIES.find((c) => c.key === cat) || CATEGORIES[1];
  const isReport = cat === 'REPORT';
  const isFreeAdoption = cat === 'FREE_ADOPTION';

  return (
    <div className={styles.pageWrapper}>
      <article className={styles.article}>
        {/* Hero Section */}
        <ReviewDetailHero
          review={review}
          cleanTitle={cleanTitle}
          isReport={isReport}
          isFreeAdoption={isFreeAdoption}
          cat={cat}
          catInfo={catInfo}
          setIsLightboxOpen={setIsLightboxOpen}
        />
        {/* Content Section */}
        <div className={styles.contentSection}>
          <div className={styles.toolbar}>
            <ReviewReactionActions
              handleLike={handleLike}
              handleBookmark={handleBookmark}
              isLiked={isLiked}
              likeCount={likeCount}
              isBookmarked={isBookmarked}
              isReactionLoading={isReactionLoading}
            />
            <button onClick={handleShare} className={styles.shareBtn} title="링크 복사 및 공유하기">
              {isCopied ? (
                <>
                  <Check size={15} className={styles.shareCopiedIcon} />
                  <span className={styles.shareCopiedText}>링크 복사됨</span>
                </>
              ) : (
                <>
                  <Share2 size={15} />
                  <span>공유하기</span>
                </>
              )}
            </button>

            {isAuthenticated && (
              <div className={styles.inlineActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => navigate(`/reviews/${id}/edit`)}
                >
                  <Edit3 size={15} />
                  <span>수정</span>
                </button>
                {isAdmin && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={15} />
                    <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
          <ReviewDetailContent
            isReport={isReport}
            isFreeAdoption={isFreeAdoption}
            review={review}
          />
          {/* 목록으로 버튼 */}
          <button className={styles.backBtn} onClick={() => navigate('/reviews')}>
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

      {/* 이미지 라이트박스 모달 */}
      {review?.img && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          imageUrl={review.img}
          alt={cleanTitle}
          caption={`${cleanTitle}${review.name ? ` • 작성자: ${review.name}` : ''}`}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default AdoptionReviewDetail;
