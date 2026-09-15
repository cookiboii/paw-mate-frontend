import styles from '../../styles/pages/MyPage.module.css';
import type { User } from '../../types/auth';

interface Props {
  userInfo: User;
  handleDeleteAccount: () => void;
}

export default function MyPageProfileTab({
  userInfo,
  handleDeleteAccount,
}: Props) {
  return (
    <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>내 프로필</h3>
                    <p>기본 회원 정보를 확인하고 관리하세요.</p>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>이름</span>
                      <span className={styles.value}>{userInfo.name}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>이메일</span>
                      <span className={styles.value}>{userInfo.email}</span>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <button className={styles.deleteButton} onClick={handleDeleteAccount}>
                      회원 탈퇴
                    </button>
                  </div>
                </section>
  );
}
