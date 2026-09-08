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

      <div className={styles.sectionBody} style={{ padding: 0 }}>
        {pendingList.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              현재 처리 대기 중인 입양 신청이 없습니다!
            </p>
            <span style={{ fontSize: '0.85rem' }}>모든 신청서가 신속하게 검토되었습니다.</span>
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
                  <th style={{ textAlign: 'right' }}>빠른 처리</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((item) => (
                  <tr key={item.adoptionId}>
                    <td>
                      <strong>{item.memberName || item.userName || '신청자'}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.phone || '-'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>동물 #{item.animalId || '-'}</span>
                      {item.animalBreed && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          ({item.animalBreed})
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {item.applyDate ? formatDateTime(item.applyDate) : '-'}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgePending}`}>심사 대기</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
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
