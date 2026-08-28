import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import styles from '../../styles/AdminAdoptionsPage.module.css';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDateTime, formatDate } from '../../utils/date';
import usePageTitle from '../../hooks/usePageTitle';

// API 명세: AdoptionResponseDto { adoptionId, memberName, status, interviewer?, animalImage?, applyDate? }
// 서버가 추가 정보를 반환하는 경우를 대비해 optional 필드 포함
interface AdminAdoptionItem {
  adoptionId: number | string;
  animalId?: number | string;
  animalBreed?: string;
  animalImage?: string;
  userName?: string;      // 혹시 서버가 userName으로 반환하는 경우
  memberName?: string;    // API 명세 기준 필드
  phone?: string;
  housingType?: string;
  hasPet?: string;
  applyDate?: string;
  status: string;
  reason?: string;
  interview?: string;
  interviewer?: string;
}

const AdminAdoptionsPage: React.FC = () => {
  usePageTitle('입양 신청 관리 (Admin)');
  const [adoptions, setAdoptions] = useState<AdminAdoptionItem[]>([]);
  const [processingId, setProcessingId] = useState<number | string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedAdoption, setSelectedAdoption] = useState<AdminAdoptionItem | null>(null); // 상세 모달용
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    adoptionId: number | string | null;
    status: string | null;
  }>({ isOpen: false, adoptionId: null, status: null });
  const { showToast } = useToast();

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    try {
      const res = await axios.get('/adoptions/all');
      const data = res.data.result || res.data || [];
      setAdoptions(data);
    } catch {
      showToast('입양 신청 목록을 불러오지 못했습니다.', 'error');
    }
  };

  const requestStatusUpdate = (adoptionId: number | string, status: string) => {
    if (!adoptionId) {
      showToast('올바르지 않은 신청 항목입니다.', 'error');
      return;
    }
    setConfirmState({ isOpen: true, adoptionId, status });
  };

  const handleConfirmStatus = async () => {
    const { adoptionId, status } = confirmState;
    if (!adoptionId || !status) return;

    setConfirmState({ isOpen: false, adoptionId: null, status: null });
    const actionText = status === 'APPROVED' ? '승인' : '거절';

    setProcessingId(adoptionId);

    try {
      // 📌 API 명세서 Body: AdoptionUpdateRequestDto { adoptionStatus }
      await axios.put(`/adoptions/${adoptionId}/status`, {
        adoptionStatus: status,
      });

      showToast(`입양 신청이 성공적으로 ${actionText}되었습니다.`, 'success');

      // 낙관적 UI 업데이트
      setAdoptions((prev) =>
        prev.map((item) =>
          item.adoptionId === adoptionId ? { ...item, status: status } : item
        )
      );

      if (selectedAdoption?.adoptionId === adoptionId) {
        setSelectedAdoption((prev) => (prev ? { ...prev, status } : null));
      }

      fetchAdoptions();
    } catch (err: any) {
      console.error('상태 변경 실패:', err);
      showToast('상태 변경에 실패했습니다: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const isPending = (status?: string) => {
    const s = (status || 'PENDING').toUpperCase();
    return s === 'PENDING';
  };

  const renderStatusBadge = (status?: string) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'APPROVED') {
      return <span className={`${styles.statusBadge} ${styles.badgeApproved}`}>승인 완료</span>;
    }
    if (s === 'REJECTED') {
      return <span className={`${styles.statusBadge} ${styles.badgeRejected}`}>반려됨</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.badgePending}`}>심사 대기</span>;
  };

  const filteredAdoptions = adoptions.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return (item.status || 'PENDING').toUpperCase() === filterStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>📋 입양 신청 관리</h2>
          <p className={styles.subtitle}>접수된 입양 신청서를 검토하고 승인 또는 반려 처리합니다.</p>
        </div>

        {/* 필터 탭 */}
        <div className={styles.filterTabs}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              className={`${styles.filterTab} ${filterStatus === st ? styles.activeTab : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'ALL' ? '전체' : st === 'PENDING' ? '심사대기' : st === 'APPROVED' ? '승인' : '반려'}
            </button>
          ))}
        </div>
      </div>

      {filteredAdoptions.length === 0 ? (
        <div className={styles.emptyCard}>
          <span>🐾</span>
          <p>해당 조건의 입양 신청 내역이 없습니다.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>입양 대상 동물</th>
                <th>신청자 정보</th>
                <th>연락처</th>
                <th>주거 / 반려동물</th>
                <th>신청일</th>
                <th>상태</th>
                <th style={{ textAlign: 'center' }}>관리 / 심사</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdoptions.map((adoption) => (
                <tr key={adoption.adoptionId}>
                  {/* 동물 정보 */}
                  <td>
                    <div className={styles.animalCell}>
                      {adoption.animalImage && (
                        <img src={adoption.animalImage} alt="동물" className={styles.animalThumb} />
                      )}
                      <div>
                        <strong>{adoption.animalBreed || '동물 ID: ' + adoption.animalId}</strong>
                        <span className={styles.cellSubText}>#{adoption.animalId}</span>
                      </div>
                    </div>
                  </td>

                  {/* 신청자 이름 */}
                  <td>
                    <strong>{adoption.userName || adoption.memberName || '신청자'}</strong>
                  </td>

                  {/* 연락처 */}
                  <td>
                    <span className={styles.phoneText}>{adoption.phone || '-'}</span>
                  </td>

                  {/* 주거 형태 & 반려동물 */}
                  <td>
                    <div>{adoption.housingType || '미기재'}</div>
                    <span className={styles.cellSubText}>반려동물: {adoption.hasPet || '없음'}</span>
                  </td>

                  {/* 신청일 */}
                  <td>
                    {formatDate(adoption.applyDate)}
                  </td>

                  {/* 상태 뱃지 */}
                  <td>{renderStatusBadge(adoption.status)}</td>

                  {/* 관리 버튼 */}
                  <td style={{ textAlign: 'center' }}>
                    <div className={styles.actionCell}>
                      <button
                        className={styles.viewDetailBtn}
                        onClick={() => setSelectedAdoption(adoption)}
                      >
                        신청서 보기
                      </button>

                      {isPending(adoption.status) && (
                        <div className={styles.buttonGroup}>
                          <button
                            className={styles.acceptBtn}
                            onClick={() => requestStatusUpdate(adoption.adoptionId, 'APPROVED')}
                            disabled={processingId === adoption.adoptionId}
                          >
                            승인
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => requestStatusUpdate(adoption.adoptionId, 'REJECTED')}
                            disabled={processingId === adoption.adoptionId}
                          >
                            거절
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📌 입양 신청서 상세 모달 */}
      {selectedAdoption && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAdoption(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>🐾 입양 신청서 상세 보기</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedAdoption(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4>신청자 정보</h4>
                <div className={styles.modalGrid}>
                  <div><strong>이름:</strong> {selectedAdoption.userName || selectedAdoption.memberName}</div>
                  <div><strong>연락처:</strong> {selectedAdoption.phone || '미기재'}</div>
                  <div><strong>주거형태:</strong> {selectedAdoption.housingType || '미기재'}</div>
                  <div><strong>반려동물 유무:</strong> {selectedAdoption.hasPet || '미기재'}</div>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h4>입양 동기 및 돌봄 계획</h4>
                <div className={styles.reasonBox}>
                  {selectedAdoption.reason || selectedAdoption.interview || '작성된 내용이 없습니다.'}
                </div>
              </div>

              <div className={styles.modalStatusRow}>
                <span>현재 상태: {renderStatusBadge(selectedAdoption.status)}</span>
                {selectedAdoption.applyDate && (
                  <span>신청일시: {formatDateTime(selectedAdoption.applyDate)}</span>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              {isPending(selectedAdoption.status) ? (
                <>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => requestStatusUpdate(selectedAdoption.adoptionId, 'APPROVED')}
                    disabled={processingId === selectedAdoption.adoptionId}
                  >
                    입양 승인
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => requestStatusUpdate(selectedAdoption.adoptionId, 'REJECTED')}
                    disabled={processingId === selectedAdoption.adoptionId}
                  >
                    입양 거절
                  </button>
                </>
              ) : (
                <button className="btn-secondary" onClick={() => setSelectedAdoption(null)}>
                  닫기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 커스텀 승인/거절 확인 모달 */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.status === 'APPROVED' ? '입양 승인 확인' : '입양 거절 확인'}
        message={
          confirmState.status === 'APPROVED'
            ? '해당 입양 신청을 승인하시겠습니까? 승인 후 입양 절차가 진행됩니다.'
            : '해당 입양 신청을 거절하시겠습니까? 거절 사유가 신청자에게 안내됩니다.'
        }
        confirmText={confirmState.status === 'APPROVED' ? '승인하기' : '거절하기'}
        cancelText="취소"
        variant={confirmState.status === 'APPROVED' ? 'default' : 'danger'}
        onConfirm={handleConfirmStatus}
        onCancel={() => setConfirmState({ isOpen: false, adoptionId: null, status: null })}
      />
    </div>
  );
};

export default AdminAdoptionsPage;
