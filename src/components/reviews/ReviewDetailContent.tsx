import styles from '../../styles/pages/AdoptionReviewDetail.module.css';
import { AlertTriangle, Gift } from 'lucide-react';
import type { ReviewDetailData } from '../../types/review';

interface Props {
  isReport: boolean;
  isFreeAdoption: boolean;
  review: ReviewDetailData;
}

export default function ReviewDetailContent({
  isReport,
  isFreeAdoption,
  review,
}: Props) {
  return (
    <>
      {/* 유기동물 제보 긴급 안내 */}
      {isReport && (
        <div className={styles.reportBanner}>
          <strong>
            <AlertTriangle size={18} />
            <span>이 글은 유기동물 제보 게시글입니다</span>
          </strong>
          <p>도움이 필요하신 분은 <strong>동물보호 상담전화 1577-0954</strong>로 연락해 주세요.</p>
        </div>
      )}

      {/* 무료 분양 안내 */}
      {isFreeAdoption && (
        <div className={styles.freeAdoptionBanner}>
          <strong>
            <Gift size={18} />
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
    </>
  );
}
