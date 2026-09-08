import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from '../../../styles/AdminDashboardPage.module.css';
import { AdoptionResponseDto } from '../../../types/adoption';
import { formatDateTime } from '../../../utils/date';

interface DashboardRecentAdoptionsProps {
  pendingList: AdoptionResponseDto[];
  pendingCount: number;
  onRequestStatusChange: (adoptionId: number | string, status: string, applicantName: string) => void;
}

export const DashboardRecentAdoptions: React.FC<DashboardRecentAdoptionsProps> = ({
  pendingList,
  pendingCount,
  onRequestStatusChange,
}) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <ClipboardList size={18} color="var(--primary-color)" />
          <span>처리 대기 중인 입양 신청 ({pendingCount}건)</span>
        </div>
        <Link to="/admin/adoptions" className={styles.viewAllLink}>
          <span>전체 보기</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className={`${styles.sectionBody} ${styles.noPadding}`}>
        {pendingList.length === 0 ? (
          <div className={styles.emptyAdoptions}>
            <CheckCircle2 size={40} color="#10b981" className={styles.emptyCheckIcon} />
            <p className={styles.emptyTitle}>
              현재 처리 대기 중인 입양 신청이 없습니다!
            </p>
            <span className={styles.emptyDesc}>모든 신청서가 신속하게 검토되었습니다.</span>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>신청자</th>
                  <th>신청 대상</th>
                  <th>신청 일시</th>
                  <th>상태</th>
                  <th className={styles.textRight}>빠른 처리</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((item) => (
                  <tr key={item.adoptionId}>
                    <td>
                      <strong>{item.memberName || item.userName || '신청자'}</strong>
                      <div className={styles.applicantEmail}>
                        {item.phone || '-'}
                      </div>
                    </td>
                    <td>
                      <span className={styles.animalIdHighlight}>동물 #{item.animalId || '-'}</span>
                      {item.animalBreed && (
                        <span className={styles.animalBreedSub}>
                          ({item.animalBreed})
                        </span>
                      )}
                    </td>
                    <td className={styles.applyDateCell}>
                      {item.applyDate ? formatDateTime(item.applyDate) : '-'}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgePending}`}>심사 대기</span>
                    </td>
                    <td className={styles.textRight}>
                      <div className={`${styles.actionBtns} ${styles.actionBtnsEnd}`}>
                        <button
                          type="button"
                          className={`${styles.btnSm} ${styles.btnApprove}`}
                          onClick={() =>
                            onRequestStatusChange(
                              item.adoptionId,
                              'APPROVED',
                              item.memberName || item.userName || '신청자'
                            )
                          }
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          className={`${styles.btnSm} ${styles.btnReject}`}
                          onClick={() =>
                            onRequestStatusChange(
                              item.adoptionId,
                              'REJECTED',
                              item.memberName || item.userName || '신청자'
                            )
                          }
                        >
                          반려
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRecentAdoptions;
