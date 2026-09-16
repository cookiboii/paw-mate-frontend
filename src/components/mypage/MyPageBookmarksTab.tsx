import styles from '../../styles/pages/MyPage.module.css';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import Spinner from '../Spinner';
import { formatDate } from '../../utils/date';
import type { PostResponseDto } from '../../types/review';

interface Props {
  bookmarkedReviews: PostResponseDto[];
  isBookmarksLoading: boolean;
}

export default function MyPageBookmarksTab({ bookmarkedReviews, isBookmarksLoading }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardHeaderTitle}>
          <Bookmark size={20} className={styles.favHeaderIcon} />
          <span>저장한 게시글</span>
        </h3>
        <p>나중에 다시 보고 싶은 커뮤니티 글을 모아볼 수 있습니다.</p>
      </div>
      <div className={styles.cardBody}>
        {isBookmarksLoading ? (
          <Spinner />
        ) : bookmarkedReviews.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.centerIcon}>
              <Bookmark size={40} />
            </span>
            <p>아직 저장한 게시글이 없습니다.</p>
            <Link to="/reviews" className={`btn-primary ${styles.emptyStateLink}`}>
              게시판 둘러보기
            </Link>
          </div>
        ) : (
          <ul className={styles.bookmarkList}>
            {bookmarkedReviews.map((review) => (
              <li key={review.id}>
                <Link to={`/reviews/${review.id}`} className={styles.bookmarkItem}>
                  <strong>{review.title}</strong>
                  <span>
                    {review.name || '익명'} · {formatDate(review.createdAt || review.createAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
