import styles from '../../styles/pages/AdoptionReviewDetail.module.css';
import { AlertTriangle, Gift, HeartHandshake, Maximize2 } from 'lucide-react';
import { formatDate } from '../../utils/date';
import type { ReviewDetailData } from '../../types/review';
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

interface Props {
  review: ReviewDetailData;
  cleanTitle: string;
  isReport: boolean;
  isFreeAdoption: boolean;
  cat: string;
  catInfo: { label: string };
  setIsLightboxOpen: (open: boolean) => void;
}

export default function ReviewDetailHero({
  review,
  cleanTitle,
  isReport,
  isFreeAdoption,
  cat,
  catInfo,
  setIsLightboxOpen,
}: Props) {
  return (
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
        <>
          <img
            src={review.img}
            alt={cleanTitle}
            className={styles.heroImage}
            onClick={() => setIsLightboxOpen(true)}
            title="클릭하여 크게 보기"
          />
          <button
            type="button"
            className={styles.heroExpandBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            title="사진 크게 보기"
            aria-label="사진 크게 보기"
          >
            <Maximize2 size={15} />
            <span>크게 보기</span>
          </button>
        </>
      ) : (
        <div
          className={`${styles.noImage} ${
            isReport ? styles.noImageReport : isFreeAdoption ? styles.noImageFreeAdoption : ''
          }`}
        >
          <span>{renderCategoryIcon(cat, 56)}</span>
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
            {review.createdAt && (
              <span className={styles.dateText}>
                {formatDate(review.createdAt, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
