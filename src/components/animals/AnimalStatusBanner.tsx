import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { AnimalStatus } from '../../constants/animal';
import styles from '../../styles/pages/AnimalDetail.module.css';
export default function AnimalStatusBanner({ status }: { status: string }) {
  if (status === AnimalStatus.PROTECTED) {
    return (
      <div className={`${styles.statusBanner} ${styles.bannerProtected}`}>
        <span className={styles.bannerIcon}>
          <CheckCircle2 size={20} />
        </span>
        <span className={styles.bannerMessage}>
          현재 새로운 평생 가족의 입양 신청을 적극 기다리고 있습니다!
        </span>
      </div>
    );
  }
  if (status === AnimalStatus.WAITING) {
    return (
      <div className={`${styles.statusBanner} ${styles.bannerWaiting}`}>
        <span className={styles.bannerIcon}>
          <Clock size={20} />
        </span>
        <span className={styles.bannerMessage}>
          보호소에서 따뜻한 관심과 돌봄을 받으며 대기 중입니다.
        </span>
      </div>
    );
  }
  if (status === AnimalStatus.ADOPTED) {
    return (
      <div className={`${styles.statusBanner} ${styles.bannerAdopted}`}>
        <span className={styles.bannerIcon}>
          <Sparkles size={20} />
        </span>
        <span className={styles.bannerMessage}>
          새로운 보금자리를 찾아 떠났습니다! 많은 축하 부탁드립니다.
        </span>
      </div>
    );
  }
  return null;
}
