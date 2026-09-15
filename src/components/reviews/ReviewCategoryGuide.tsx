import { AlertTriangle, Gift, MapPin, Calendar, PawPrint, Phone, AlertCircle, Heart } from 'lucide-react';
import type { PostCategory } from '../../types/review';
import styles from '../../styles/pages/AdoptionReview.module.css';
export default function ReviewCategoryGuide({ selectedCategory }: { selectedCategory: PostCategory }) {
  return (
    <>
      {/* 유기동물 제보 전용 안내 배너 */}
      {selectedCategory === 'REPORT' && (
        <div className={styles.reportGuide}>
          <strong className={styles.guideHeader}>
            <AlertTriangle size={18} />
            <span>제보 시 포함해주세요</span>
          </strong>
          <ul>
            <li className={styles.guideItem}><MapPin size={15} /> <strong>위치</strong>: 발견 장소 (시/구/동 또는 주요 건물명)</li>
            <li className={styles.guideItem}><Calendar size={15} /> <strong>시간</strong>: 발견 일시</li>
            <li className={styles.guideItem}><PawPrint size={15} /> <strong>상태</strong>: 동물 종류, 외형, 부상 여부</li>
            <li className={styles.guideItem}><Phone size={15} /> <strong>연락처</strong> (선택): 제보자 연락 가능 여부</li>
          </ul>
          <p className={styles.reportEmergency}>긴급 구조가 필요한 경우 <strong>동물보호 상담전화 1577-0954</strong>로 연락하세요.</p>
        </div>
      )}

      {/* 무료 분양 전용 안내 배너 */}
      {selectedCategory === 'FREE_ADOPTION' && (
        <div className={styles.freeAdoptionGuide}>
          <strong className={styles.guideHeader}>
            <Gift size={18} />
            <span>무료 분양 등록 안내</span>
          </strong>
          <ul>
            <li className={styles.guideItem}><PawPrint size={15} /> <strong>아이 정보</strong>: 품종, 나이, 성별, 건강 상태 (예방접종 / 중성화 여부)</li>
            <li className={styles.guideItem}><MapPin size={15} /> <strong>지역</strong>: 분양 가능 지역 (직거래 권장)</li>
            <li className={styles.guideItem}><Heart size={15} /> <strong>입양 조건</strong>: 가족 구성원 동의, 주거 환경, 사후 연락 가능 여부</li>
            <li className={styles.guideItem}><AlertCircle size={15} /> <strong>주의</strong>: 책임비를 제외한 일체의 상업적 유료 분양은 금지됩니다.</li>
          </ul>
          <p className={styles.freeAdoptionNotice}>소중한 한 생명을 평생 가족으로 보낼 수 있도록 신중하게 작성해 주세요.</p>
        </div>
      )}
    </>
  );
}
