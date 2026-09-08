import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Clock, Users, HeartHandshake } from 'lucide-react';
import styles from '../../../styles/AdminDashboardPage.module.css';

export interface DashboardStats {
  totalAnimals: number;
  protectedAnimals: number;
  waitingAnimals: number;
  adoptedAnimals: number;
  dogCount: number;
  catCount: number;
  etcCount: number;
  totalUsers: number;
  adminCount: number;
  totalAdoptions: number;
  pendingCount: number;
  approvedAdoptions: number;
  rejectedAdoptions: number;
}

interface DashboardMetricsProps {
  stats: DashboardStats;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ stats }) => {
  return (
    <div className={styles.statsGrid}>
      {/* 1. 동물 관리 */}
      <Link to="/admin/animals" className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.statIconPaw}`}>
          <PawPrint size={28} />
        </div>
        <div className={styles.statInfo}>
          <div className={styles.statLabel}>등록된 보호 동물</div>
          <div className={styles.statValue}>{stats.totalAnimals}마리</div>
          <div className={styles.statSubtext}>
            보호중 {stats.protectedAnimals} • 입양완료 {stats.adoptedAnimals}
          </div>
        </div>
      </Link>

      {/* 2. 입양 심사 대기 */}
      <Link to="/admin/adoptions" className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.statIconPending}`}>
          <Clock size={28} />
        </div>
        <div className={styles.statInfo}>
          <div className={styles.statLabel}>
            심사 대기 신청
            {stats.pendingCount > 0 && (
              <span className={styles.badgeWarning}>{stats.pendingCount}건 처리 필요</span>
            )}
          </div>
          <div
            className={styles.statValue}
            style={{ color: stats.pendingCount > 0 ? '#d97706' : 'inherit' }}
          >
            {stats.pendingCount}건
          </div>
          <div className={styles.statSubtext}>
            전체 신청 {stats.totalAdoptions}건 중
          </div>
        </div>
      </Link>

      {/* 3. 회원 관리 */}
      <Link to="/admin/users" className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.statIconUsers}`}>
          <Users size={28} />
        </div>
        <div className={styles.statInfo}>
          <div className={styles.statLabel}>가입 회원</div>
          <div className={styles.statValue}>{stats.totalUsers}명</div>
          <div className={styles.statSubtext}>
            일반 {stats.totalUsers - stats.adminCount}명 • 관리자 {stats.adminCount}명
          </div>
        </div>
      </Link>

      {/* 4. 입양 성사 */}
      <Link to="/admin/adoptions" className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.statIconReviews}`}>
          <HeartHandshake size={28} />
        </div>
        <div className={styles.statInfo}>
          <div className={styles.statLabel}>입양 성사 완료</div>
          <div className={styles.statValue}>{stats.approvedAdoptions}건</div>
          <div className={styles.statSubtext}>새 가족을 찾은 아이들</div>
        </div>
      </Link>
    </div>
  );
};

export default DashboardMetrics;
