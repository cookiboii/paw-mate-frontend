import styles from '../../styles/pages/AdoptionReviewDetail.module.css';
import { Heart, Bookmark } from 'lucide-react';

interface Props {
  handleLike: () => Promise<void>;
  handleBookmark: () => Promise<void>;
  isLiked: boolean;
  likeCount: number;
  isBookmarked: boolean;
  isReactionLoading: boolean;
}

export default function ReviewReactionActions({
  handleLike,
  handleBookmark,
  isLiked,
  likeCount,
  isBookmarked,
  isReactionLoading,
}: Props) {
  return (
    <div className={styles.reactionActions}>
      <button
        type="button"
        onClick={handleLike}
        className={`${styles.reactionBtn} ${isLiked ? styles.reactionActive : ''}`}
        aria-pressed={isLiked}
        disabled={isReactionLoading}
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        <span>좋아요 {likeCount}</span>
      </button>
      <button
        type="button"
        onClick={handleBookmark}
        className={`${styles.reactionBtn} ${isBookmarked ? styles.reactionActive : ''}`}
        aria-pressed={isBookmarked}
        disabled={isReactionLoading}
      >
        <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
        <span>{isBookmarked ? '저장됨' : '북마크'}</span>
      </button>
    </div>
  );
}
