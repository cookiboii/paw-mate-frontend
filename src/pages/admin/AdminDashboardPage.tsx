import React, { useEffect, useState, useMemo } from 'react';
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
import { getErrorMessage } from '../../utils/error';
import DashboardMetrics, { DashboardStats } from '../../components/admin/dashboard/DashboardMetrics';
import DashboardRecentAdoptions from '../../components/admin/dashboard/DashboardRecentAdoptions';
import DashboardCharts from '../../components/admin/dashboard/DashboardCharts';

const AdminDashboardPage: React.FC = () => {
  usePageTitle('관리자 종합 대시보드 | AdoptMate');
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [adoptions, setAdoptions] = useState<AdoptionResponseDto[]>([]);

  // 빠른 승인/반려 확인 모달
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
        fetchAnimalList(0, 100).catch(() => ({ content: [] as Animal[] })),
        getAllUsers().catch(() => []),
        getAllAdoptions().catch(() => []),
      ]);

      setAnimals(animalRes.content || []);
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
  const stats: DashboardStats = useMemo(() => {
    const totalAnimals = animals.length;
    const protectedAnimals = animals.filter((a) => (a.status || '').toUpperCase() === 'PROTECTED').length;
    const waitingAnimals = animals.filter((a) => (a.status || '').toUpperCase() === 'WAITING').length;
    const adoptedAnimals = animals.filter((a) => (a.status || '').toUpperCase() === 'ADOPTED').length;

    const dogCount = animals.filter((a) => (a.species || '').toUpperCase() === 'DOG').length;
    const catCount = animals.filter((a) => (a.species || '').toUpperCase() === 'CAT').length;
    const etcCount = totalAnimals - dogCount - catCount;

    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === 'ADMIN' || u.role === 'ROLE_ADMIN').length;

    const totalAdoptions = adoptions.length;
    const pendingAdoptions = adoptions.filter((a) => (a.status || 'PENDING').toUpperCase() === 'PENDING');
    const approvedAdoptions = adoptions.filter((a) => (a.status || '').toUpperCase() === 'APPROVED').length;
    const rejectedAdoptions = adoptions.filter((a) => (a.status || '').toUpperCase() === 'REJECTED').length;

    return {
      totalAnimals,
      protectedAnimals,
      waitingAnimals,
      adoptedAnimals,
      dogCount,
      catCount,
      etcCount,
      totalUsers,
      adminCount,
      totalAdoptions,
      pendingCount: pendingAdoptions.length,
      approvedAdoptions,
      rejectedAdoptions,
    };
  }, [animals, users, adoptions]);

  const pendingList = useMemo(() => {
    return adoptions
      .filter((a) => (a.status || 'PENDING').toUpperCase() === 'PENDING')
      .slice(0, 5);
  }, [adoptions]);

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

      setAdoptions((prev) =>
        prev.map((item) => (item.adoptionId === adoptionId ? { ...item, status } : item))
      );
    } catch (err: unknown) {
      showToast('상태 변경 실패: ' + getErrorMessage(err, '상태 변경에 실패했습니다.'), 'error');
    }
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${styles.loadingContainer}`}>
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

      {/* 4가지 핵심 지표 카드 */}
      <DashboardMetrics stats={stats} />

      {/* 대시보드 상세 섹션 그리드 */}
      <div className={styles.dashboardGrid}>
        {/* 좌측: 빠른 입양 심사 위젯 */}
        <DashboardRecentAdoptions
          pendingList={pendingList}
          pendingCount={stats.pendingCount}
          onRequestStatusChange={requestQuickStatus}
        />

        {/* 우측: 바로가기 및 분석 시각화 차트 */}
        <DashboardCharts stats={stats} />
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
