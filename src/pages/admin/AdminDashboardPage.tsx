import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/AdminDashboardPage.module.css';
import { fetchAnimalList } from '../../api/animal';
import { getAllUsers } from '../../api/user';
import { getAllAdoptions, updateAdoptionStatus } from '../../api/adoption';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/Spinner';
import usePageTitle from '../../hooks/usePageTitle';
import { Animal } from '../../types/animal';
import { User } from '../../types/auth';
import { AdoptionResponseDto } from '../../types/adoption';
import { formatDateTime } from '../../utils/date';
import {
  PawPrint,
  Users,
  ClipboardList,
  Clock,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Zap,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  usePageTitle('관리자 종합 대시보드 | AdoptMate');
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [adoptions, setAdoptions] = useState<AdoptionResponseDto[]>([]);

  // 빠른 승인/반려 모달
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    adoptionId: number | string | null;
    status: string | null;
    applicantName: string;
  }>({
    isOpen: false,
    adoptionId: null,
    status: null,
    applicantName: '',
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [animalRes, userRes, adoptionRes] = await Promise.all([
        fetchAnimalList(0, 100).catch(() => ({ content: [] })),
        getAllUsers().catch(() => []),
        getAllAdoptions().catch(() => []),
      ]);

      const animalData =
        'result' in animalRes && animalRes.result
          ? animalRes.result.content || []
          : 'content' in animalRes
          ? animalRes.content || []
          : [];

      setAnimals(animalData as Animal[]);
      setUsers(userRes || []);
      setAdoptions(adoptionRes || []);
    } catch (err) {
      console.error('대시보드 데이터 로딩 실패:', err);
      showToast('대시보드 데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 통계 계산
  const stats = useMemo(() => {
    const totalAnimals = animals.length;
    const protectedAnimals = animals.filter((a) => (a.status || '').toUpperCase() === 'PROTECTED').length;
    const waitingAnimals = animals.filter((a) => (a.status || '').toUpperCase() === 'WAITING').length;
    const adoptedAnimals = animals.filter((a) => (a.status || '').toUpperCase() === 'ADOPTED').length;

    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === 'ADMIN' || u.role === 'ROLE_ADMIN').length;

    const totalAdoptions = adoptions.length;
    const pendingAdoptions = adoptions.filter((a) => (a.status || 'PENDING').toUpperCase() === 'PENDING');
    const approvedAdoptions = adoptions.filter((a) => (a.status || '').toUpperCase() === 'APPROVED').length;

    return {
      totalAnimals,
      protectedAnimals,
      waitingAnimals,
      adoptedAnimals,
      totalUsers,
      adminCount,
      totalAdoptions,
      pendingCount: pendingAdoptions.length,
      pendingList: pendingAdoptions.slice(0, 5), // 상위 5건
      approvedAdoptions,
    };
  }, [animals, users, adoptions]);

  const requestQuickStatus = (adoptionId: number | string, status: string, applicantName: string) => {
    setConfirmModal({
      isOpen: true,
      adoptionId,
      status,
      applicantName,
    });
  };

  const handleConfirmQuickStatus = async () => {
    const { adoptionId, status } = confirmModal;
    if (!adoptionId || !status) return;

    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    try {
      await updateAdoptionStatus(adoptionId, status);
      showToast(`입양 신청이 성공적으로 ${status === 'APPROVED' ? '승인' : '반려'}되었습니다.`, 'success');

      // 로컬 상태 갱신
      setAdoptions((prev) =>
        prev.map((item) => (item.adoptionId === adoptionId ? { ...item, status } : item))
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast('상태 변경 실패: ' + errorMsg, 'error');
    }
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>관리자 종합 대시보드</h2>
        <p className={styles.subtitle}>
          입양 플랫폼 운영 현황 및 미처리 업무를 실시간으로 모니터링합니다.
        </p>
      </div>

      {/* 4가지 핵심 통계 카드 */}
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

        {/* 2. 입양 심사 대기 (강조) */}
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
            <div className={styles.statValue} style={{ color: stats.pendingCount > 0 ? '#d97706' : 'inherit' }}>
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
            <div className={styles.statSubtext}>
              새 가족을 찾은 아이들
            </div>
          </div>
        </Link>
      </div>

      {/* 대시보드 상세 섹션 그리드 */}
      <div className={styles.dashboardGrid}>
        {/* 좌측: 빠른 입양 심사 위젯 */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <ClipboardList size={18} color="var(--primary-color)" />
              <span>처리 대기 중인 입양 신청 ({stats.pendingCount}건)</span>
            </div>
            <Link to="/admin/adoptions" className={styles.viewAllLink}>
              <span>전체 보기</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.sectionBody} style={{ padding: 0 }}>
            {stats.pendingList.length === 0 ? (
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
                    {stats.pendingList.map((item) => (
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
                                requestQuickStatus(
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
                                requestQuickStatus(
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

        {/* 우측: 빠른 작업 바로가기 & 보호 현황 차트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. 빠른 관리 액션 */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Zap size={18} color="var(--primary-color)" />
                <span>빠른 관리 바로가기</span>
              </div>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.quickActionsList}>
                <Link to="/admin/animals" className={styles.quickActionItem}>
                  <div className={styles.quickActionIcon}>
                    <PawPrint size={18} />
                  </div>
                  <div>
                    <div>보호 동물 관리 및 상태 변경</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      보호중/대기/입양완료 원클릭 관리
                    </div>
                  </div>
                </Link>

                <Link to="/admin/animals?tab=register" className={styles.quickActionItem}>
                  <div className={styles.quickActionIcon}>
                    <PlusCircle size={18} />
                  </div>
                  <div>
                    <div>신규 보호 동물 등록</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      사진 및 상세 정보 업로드
                    </div>
                  </div>
                </Link>

                <Link to="/admin/users" className={styles.quickActionItem}>
                  <div className={styles.quickActionIcon}>
                    <Users size={18} />
                  </div>
                  <div>
                    <div>회원 및 관리자 권한 관리</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      권한 부여 및 가입 현황
                    </div>
                  </div>
                </Link>

                <Link to="/benchmark" className={styles.quickActionItem} style={{ borderColor: 'rgba(234, 88, 12, 0.3)' }}>
                  <div className={styles.quickActionIcon} style={{ color: '#ea580c' }}>
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <div style={{ color: '#ea580c' }}>성능 & 동시성 테스트 랩</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      No-Offset 커서 속도 실시간 벤치마크
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. 보호 현황 프로그레스 */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <ShieldCheck size={18} color="var(--primary-color)" />
                <span>보호 동물 상태 현황</span>
              </div>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.statusBreakdown}>
                {/* 보호중 */}
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarHeader}>
                    <span>보호중</span>
                    <span>
                      {stats.protectedAnimals}마리 (
                      {stats.totalAnimals > 0
                        ? Math.round((stats.protectedAnimals / stats.totalAnimals) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${
                          stats.totalAnimals > 0
                            ? (stats.protectedAnimals / stats.totalAnimals) * 100
                            : 0
                        }%`,
                        backgroundColor: '#10b981',
                      }}
                    />
                  </div>
                </div>

                {/* 대기중 */}
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarHeader}>
                    <span>대기중</span>
                    <span>
                      {stats.waitingAnimals}마리 (
                      {stats.totalAnimals > 0
                        ? Math.round((stats.waitingAnimals / stats.totalAnimals) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${
                          stats.totalAnimals > 0
                            ? (stats.waitingAnimals / stats.totalAnimals) * 100
                            : 0
                        }%`,
                        backgroundColor: '#f59e0b',
                      }}
                    />
                  </div>
                </div>

                {/* 입양완료 */}
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarHeader}>
                    <span>입양완료</span>
                    <span>
                      {stats.adoptedAnimals}마리 (
                      {stats.totalAnimals > 0
                        ? Math.round((stats.adoptedAnimals / stats.totalAnimals) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${
                          stats.totalAnimals > 0
                            ? (stats.adoptedAnimals / stats.totalAnimals) * 100
                            : 0
                        }%`,
                        backgroundColor: '#6366f1',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 승인/반려 확인 모달 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={`입양 신청 ${confirmModal.status === 'APPROVED' ? '승인' : '반려'} 확인`}
        message={`'${confirmModal.applicantName}'님의 입양 신청을 ${
          confirmModal.status === 'APPROVED' ? '승인' : '반려'
        }하시겠습니까?`}
        confirmText={confirmModal.status === 'APPROVED' ? '승인하기' : '반려하기'}
        variant={confirmModal.status === 'APPROVED' ? 'default' : 'danger'}
        onConfirm={handleConfirmQuickStatus}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};


export default AdminDashboardPage;
