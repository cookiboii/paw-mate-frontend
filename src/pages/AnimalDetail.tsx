import AnimalStatusModal from '../components/animals/AnimalStatusModal';
import AnimalAdminActions from '../components/animals/AnimalAdminActions';
import AnimalAdoptionAction from '../components/animals/AnimalAdoptionAction';
import AnimalDetailInfo from '../components/animals/AnimalDetailInfo';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, ArrowLeft, FileText, Share2, Check, Maximize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import styles from '../styles/pages/AnimalDetail.module.css';
import ConfirmModal from '../components/ConfirmModal';
import ImageWithFallback from '../components/ImageWithFallback';
import ImageLightboxModal from '../components/ImageLightboxModal';
import Skeleton from '../components/Skeleton';
import { AnimalStatus, getGenderLabel, getStatusLabel, getSpeciesLabel } from '../constants/animal';
import usePageTitle from '../hooks/usePageTitle';
import {
  useAnimalDetailQuery,
  useDeleteAnimalMutation,
  useAnimalStatusMutation,
} from '../hooks/queries/animals';
import { useMyAdoptionsQuery } from '../hooks/queries/adoptions';
import useShare from '../hooks/useShare';
import AnimalStatusBanner from '../components/animals/AnimalStatusBanner';
import { getErrorMessage } from '../utils/error';

const AnimalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const { data: animal, isLoading: loading, error, refetch } = useAnimalDetailQuery(id);
  const deleteMutation = useDeleteAnimalMutation();
  const statusMutation = useAnimalStatusMutation();
  const adoptionsQuery = useMyAdoptionsQuery(isAuthenticated && !!id);
  const hasApplied =
    adoptionsQuery.data?.some((item) => String(item.animalId) === String(id)) ?? false;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('PROTECTED');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    if (animal) setSelectedStatus(animal.status || 'PROTECTED');
  }, [animal]);

  usePageTitle(animal ? `${animal.breed || animal.species} - 입양 상세 정보` : '동물 상세 정보');

  const isAdmin =
    isAuthenticated &&
    (user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN');

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(id);
      setIsDeleteModalOpen(false);
      showToast('동물 정보가 삭제되었습니다.', 'info');
      setTimeout(() => navigate('/animals'), 800);
    } catch (err: unknown) {
      showToast('삭제 실패: ' + getErrorMessage(err), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChangeSubmit = async () => {
    if (!id || !selectedStatus) return;
    setIsUpdatingStatus(true);
    try {
      await statusMutation.mutateAsync({ id, status: selectedStatus });
      setIsStatusModalOpen(false);
      showToast(
        `동물 보호 상태가 '${getStatusLabel(selectedStatus)}'(으)로 변경되었습니다.`,
        'success',
      );
    } catch (err: unknown) {
      showToast('상태 변경 실패: ' + getErrorMessage(err), 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleFavClick = () => {
    if (!isAuthenticated) {
      showToast('찜하기는 로그인 후 이용할 수 있습니다.', 'info');
      return;
    }
    if (animal) toggleFavorite(animal);
  };

  const goToLoginForAdoption = () => {
    navigate('/login', { state: { from: `/adopt/${id}` } });
  };

  const { isCopied, handleShare } = useShare({
    title: `[AdoptMate] ${animal?.breed || '유기동물'} 평생 가족을 찾고 있어요!`,
    text: `${animal?.breed || '유기동물'}의 입양 상세 정보를 확인해 보세요.`,
    successMessage: '동물 상세 링크가 클립보드에 복사되었습니다!',
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case AnimalStatus.PROTECTED:
        return `${styles.statusBadge} ${styles.badgeProtected}`;
      case AnimalStatus.WAITING:
        return `${styles.statusBadge} ${styles.badgeWaiting}`;
      case AnimalStatus.ADOPTED:
        return `${styles.statusBadge} ${styles.badgeAdopted}`;
      default:
        return styles.statusBadge;
    }
  };

  if (loading) {
    return (
      <section className={styles.detailContainer}>
        <div className={styles.topNavigation}>
          <Skeleton type="text" width={140} height={24} />
        </div>
        <div className={styles.card}>
          <div className={styles.imageContainer}>
            <Skeleton type="image" height={420} />
          </div>
          <div className={styles.info}>
            <Skeleton type="badge" width={80} height={26} />
            <Skeleton type="title" width="60%" height={32} />
            <div className={styles.infoGrid}>
              <Skeleton type="card" height={70} />
              <Skeleton type="card" height={70} />
              <Skeleton type="card" height={70} />
              <Skeleton type="card" height={70} />
            </div>
            <Skeleton type="card" height={50} />
            <Skeleton type="card" height={52} />
          </div>
        </div>
      </section>
    );
  }

  if (error && !animal) {
    return (
      <div className={styles.error} role="alert">
        <p>동물 정보를 불러오지 못했습니다.</p>
        <button type="button" className="btn-primary" onClick={() => refetch()}>
          다시 시도
        </button>
      </div>
    );
  }

  const canAdopt = animal?.status === AnimalStatus.PROTECTED;
  const favorite = animal ? isFavorite(animal.id) : false;

  return (
    <>
      <section className={styles.detailContainer}>
        <div className={`${styles.topNavigation} ${styles.topNavRow}`}>
          <Link to="/animals" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>전체 동물 목록으로</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className={styles.shareBtn}
            title="링크 복사 및 공유하기"
          >
            {isCopied ? (
              <>
                <Check size={16} className={styles.copiedIcon} />
                <span className={styles.copiedText}>링크 복사됨</span>
              </>
            ) : (
              <>
                <Share2 size={16} />
                <span>공유하기</span>
              </>
            )}
          </button>
        </div>

        {animal ? (
          <div className={styles.card}>
            <div
              className={styles.imageContainer}
              onClick={() => animal.image && setIsLightboxOpen(true)}
              title={animal.image ? '클릭하여 사진 크게 보기' : undefined}
            >
              <ImageWithFallback
                src={animal.image}
                alt={`${animal.breed || animal.species} 사진`}
                className={styles.image}
                fallbackText="동물 사진 준비 중입니다"
              />
              {animal.image && (
                <div className={styles.zoomBadge}>
                  <Maximize2 size={13} />
                  <span>크게 보기</span>
                </div>
              )}
              {/* 찜하기 플로팅 버튼 */}
              <button
                type="button"
                className={`${styles.favBtn} ${favorite ? styles.favActive : ''} ${!isAuthenticated ? styles.favLocked : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavClick();
                }}
                aria-label={
                  !isAuthenticated
                    ? '로그인 후 찜하기 가능'
                    : favorite
                      ? '관심 목록에서 제거'
                      : '관심 동물로 등록'
                }
                aria-pressed={isAuthenticated ? favorite : undefined}
                title={
                  !isAuthenticated
                    ? '로그인 후 찜하기 가능합니다'
                    : favorite
                      ? '관심 목록에서 제거'
                      : '관심 동물로 등록'
                }
              >
                {!isAuthenticated ? (
                  <>
                    <Lock size={15} /> <span>찜하기</span>
                  </>
                ) : favorite ? (
                  <>
                    <Heart size={16} /> <span>찜됨</span>
                  </>
                ) : (
                  <>
                    <Heart size={16} /> <span>찜하기</span>
                  </>
                )}
              </button>
            </div>

            <div className={styles.info}>
              <div className={styles.headerArea}>
                <div>
                  <span className={getStatusBadgeClass(animal.status)}>
                    {getStatusLabel(animal.status)}
                  </span>
                  <h2 className={styles.breed}>{animal.breed}</h2>
                </div>
              </div>
              <AnimalDetailInfo animal={animal} />
              {/* 상태에 따른 맞춤 안내 배너 */}
              <AnimalStatusBanner status={animal.status} />

              {/* 일반 사용자: 입양 신청 버튼 (중복 신청 방어 분기) */}
              <AnimalAdoptionAction
                isAdmin={isAdmin}
                canAdopt={canAdopt}
                hasApplied={hasApplied}
                isAuthenticated={isAuthenticated}
                id={id}
                navigate={navigate}
                goToLoginForAdoption={goToLoginForAdoption}
              />
              {/* 관리자 전용 버튼 */}
              <AnimalAdminActions
                isAdmin={isAdmin}
                isDeleting={isDeleting}
                setIsStatusModalOpen={setIsStatusModalOpen}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
              />
            </div>
          </div>
        ) : (
          <p className={styles.message}>동물 정보를 찾을 수 없습니다.</p>
        )}
      </section>
      {!isAdmin && canAdopt && !hasApplied && (
        <div className={styles.mobileAdoptCta}>
          <button
            type="button"
            onClick={isAuthenticated ? () => navigate(`/adopt/${id}`) : goToLoginForAdoption}
            className="btn-primary"
          >
            <FileText size={20} />
            <span>{isAuthenticated ? '입양 신청서 작성하기' : '로그인하고 입양 신청하기'}</span>
          </button>
        </div>
      )}

      {/* 고화질 사진 확대 라이트박스 모달 */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        imageUrl={animal?.image}
        alt={`${animal?.breed || animal?.species} 고화질 사진`}
        caption={`${animal?.breed || animal?.species} (${getSpeciesLabel(animal?.species || 'DOG')} • ${getGenderLabel(animal?.gender || 'M')} • ${animal?.age || 0}살)`}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* 관리자: 동물 보호 상태 변경 모달 */}
      <AnimalStatusModal
        isStatusModalOpen={isStatusModalOpen}
        isUpdatingStatus={isUpdatingStatus}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        handleStatusChangeSubmit={handleStatusChangeSubmit}
        onClose={() => setIsStatusModalOpen(false)}
      />

      {/* 커스텀 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="동물 정보 삭제"
        message="정말로 이 동물 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText={isDeleting ? '삭제 중...' : '삭제하기'}
        cancelText="취소"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default AnimalDetail;
