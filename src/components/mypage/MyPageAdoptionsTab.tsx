import styles from '../../styles/pages/MyPage.module.css';
import { PawPrint, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/date';
import type { AdoptionHistoryItem } from '../../types/adoption';

interface Props {
  adoptionList: AdoptionHistoryItem[];
}

export default function MyPageAdoptionsTab({
  adoptionList,
}: Props) {
  return (
    <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>입양 신청 내역</h3>
                    <p>AdoptMate를 통해 신청한 입양 상태를 확인합니다.</p>
                  </div>
                  <div className={styles.cardBody}>
                    {adoptionList.length === 0 ? (
                      <div className={styles.emptyState}>
                        <span className={styles.centerIcon}><PawPrint size={40} /></span>
                        <p>아직 입양 신청 내역이 없습니다.</p>
                      </div>
                    ) : (
                      <ul className={styles.adoptionGrid}>
                        {adoptionList.map((adoption, index) => (
                          <li key={adoption.adoptionId || index} className={styles.adoptionItem}>
                            <img
                              src={adoption.animalImage || '/default-animal.jpg'}
                              alt={adoption.animalBreed || adoption.animalName || '입양 동물'}
                              className={styles.adoptionImage}
                            />
                            <div className={styles.adoptionInfo}>
                              <h4>{adoption.animalBreed || adoption.animalName || '입양 신청 #' + (adoption.adoptionId || (index + 1))}</h4>
                              <span
                                className={`${styles.statusBadge} ${
                                  adoption.status === 'APPROVED'
                                    ? styles.statusApproved
                                    : adoption.status === 'REJECTED'
                                    ? styles.statusRejected
                                    : styles.statusPending
                                } ${styles.badgeFlex}`}
                              >
                                {adoption.status === 'APPROVED' ? (
                                  <><CheckCircle2 size={13} /> 입양 승인</>
                                ) : adoption.status === 'REJECTED' ? (
                                  <><XCircle size={13} /> 반려됨</>
                                ) : (
                                  <><Clock size={13} /> 심사 대기중</>
                                )}
                              </span>
                              <p className={styles.date}>신청일: {formatDate(adoption.applyDate)}</p>

                              {/* 진행 단계 타임라인 (백엔드 상태: PENDING, APPROVED, REJECTED) */}
                              <div className={styles.timelineWrapper}>
                                <div className={styles.stepBar}>
                                  <div className={`${styles.stepItem} ${styles.stepDone}`}>
                                    <div className={styles.stepDot}>1</div>
                                    <span className={styles.stepLabel}>신청 접수</span>
                                  </div>
                                  <div className={`${styles.stepItem} ${adoption.status === 'PENDING' ? styles.stepActive : styles.stepDone}`}>
                                    <div className={styles.stepDot}>2</div>
                                    <span className={styles.stepLabel}>신청 심사</span>
                                  </div>
                                  <div className={`${styles.stepItem} ${adoption.status === 'APPROVED' || adoption.status === 'REJECTED' ? styles.stepActive : ''}`}>
                                    <div className={styles.stepDot}>3</div>
                                    <span className={styles.stepLabel}>
                                      {adoption.status === 'REJECTED' ? '반려' : adoption.status === 'APPROVED' ? '입양 승인' : '결과 확인'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
  );
}
