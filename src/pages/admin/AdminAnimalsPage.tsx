import React, { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { PawPrint, PlusCircle } from 'lucide-react';
import { fetchAnimalList, updateAnimalStatus, deleteAnimal } from '../../api/animal';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/admin/AdminAnimalsPage.module.css';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import { getStatusLabel } from '../../constants/animal';
import usePageTitle from '../../hooks/usePageTitle';
import { Animal } from '../../types/animal';
import { getErrorMessage } from '../../utils/error';
import AdminAnimalListTab from '../../components/admin/animals/AdminAnimalListTab';
import AdminAnimalRegisterTab from '../../components/admin/animals/AdminAnimalRegisterTab';

const AdminAnimalsPage: React.FC = () => {
  usePageTitle('보호 동물 통합 관리 (Admin)');
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') === 'register' ? 'register' : 'list';
  const setActiveTab = (tab: 'list' | 'register') => {
    setSearchParams({ tab });
  };

  // 동물 목록 관리 상태
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);

  // 삭제 모달 상태
  const [deleteTarget, setDeleteTarget] = useState<Animal | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role?.toUpperCase() !== 'ADMIN' && user?.role?.toUpperCase() !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  // 동물 목록 로딩
  const loadAnimals = async () => {
    setIsLoadingList(true);
    try {
      const data = await fetchAnimalList(0, 100);
      setAnimals(data.content || []);
    } catch (err) {
      console.error('동물 목록 로드 실패:', err);
      showToast('동물 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      loadAnimals();
    }
  }, [activeTab]);

  // 상태 빠른 변경 핸들러
  const handleQuickStatusChange = async (animalId: number | string, newStatus: string) => {
    try {
      setAnimals((prev) =>
        prev.map((a) => ((a.id ?? a.animalId) === animalId ? { ...a, status: newStatus } : a))
      );

      await updateAnimalStatus(animalId, newStatus);
      showToast(`동물(#${animalId})의 보호 상태가 '${getStatusLabel(newStatus)}'(으)로 변경되었습니다.`, 'success');
    } catch (err) {
      console.error('상태 변경 실패:', err);
      showToast(getErrorMessage(err, '상태 변경에 실패했습니다.'), 'error');
      loadAnimals(); // 롤백
    }
  };

  // 삭제 확인 실행
  const handleConfirmDelete = async () => {
    const targetId = deleteTarget?.id ?? deleteTarget?.animalId;
    if (!targetId) return;
    setIsDeleting(true);
    try {
      await deleteAnimal(targetId);
      showToast(`'${deleteTarget?.breed || deleteTarget?.species}' 정보가 성공적으로 삭제되었습니다.`, 'success');
      setAnimals((prev) => prev.filter((a) => (a.id ?? a.animalId) !== targetId));
      setDeleteTarget(null);
    } catch (err) {
      console.error('삭제 실패:', err);
      showToast(getErrorMessage(err, '동물 정보 삭제에 실패했습니다.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>보호 동물 통합 관리</h2>
        <p className={styles.subtitle}>
          등록된 보호 동물 목록을 실시간으로 관리하고 새 보호 동물을 등록합니다.
        </p>
      </div>

      {/* 탭 네비게이션: 보호 동물 관리 목록 vs 신규 동물 등록 */}
      <div className={styles.tabBar}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'list' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <PawPrint size={16} />
          <span>동물 목록</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'register' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('register')}
        >
          <PlusCircle size={16} />
          <span>동물 등록</span>
        </button>
      </div>

      {/* 1. 목록 관리 탭 */}
      {activeTab === 'list' && (
        <AdminAnimalListTab
          animals={animals}
          isLoadingList={isLoadingList}
          onQuickStatusChange={handleQuickStatusChange}
          onDeleteTarget={(animal) => setDeleteTarget(animal)}
          onNavigateRegister={() => setActiveTab('register')}
        />
      )}

      {/* 2. 신규 등록 탭 */}
      {activeTab === 'register' && (
        <AdminAnimalRegisterTab onSuccess={() => setActiveTab('list')} />
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="보호 동물 정보 삭제"
        message={`'${deleteTarget?.breed || deleteTarget?.species}' (#${deleteTarget?.id ?? deleteTarget?.animalId}) 정보를 정말로 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`}
        confirmText={isDeleting ? '삭제 중...' : '삭제하기'}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminAnimalsPage;
