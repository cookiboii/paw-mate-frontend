import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  PawPrint, 
  Calendar, 
  Heart, 
  Lock, 
  Clock, 
  Sparkles, 
  ArrowLeft, 
  FileText, 
  Palette, 
  Edit3, 
  Trash2,
  Share2,
  Check,
  CheckCircle2,
  ClipboardList,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { deleteAnimal, fetchAnimalById, updateAnimalStatus } from '../api/animal';
import { getMyAdoptions } from '../api/adoption';
import styles from '../styles/pages/AnimalDetail.module.css';
import ConfirmModal from '../components/ConfirmModal';
import ImageWithFallback from '../components/ImageWithFallback';
import ImageLightboxModal from '../components/ImageLightboxModal';
import Skeleton from '../components/Skeleton';
import { AnimalStatus, STATUS_OPTIONS, getGenderLabel, getStatusLabel, getSpeciesLabel } from '../constants/animal';
import usePageTitle from '../hooks/usePageTitle';
import useCachedApi from '../hooks/useCachedApi';
import { Animal } from '../types/animal';
import { getErrorMessage } from '../utils/error';

const AnimalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const cacheKey = id ? `animal:detail:${id}` : null;
  const { data: initialAnimal, isLoading: loading, error } = useCachedApi<Animal>(
    cacheKey,
    () => fetchAnimalById(id!),
    {
      enabled: !!id,
      onError: (err) => {
        console.warn('동물 정보 조회 실패:', err);
      },
    }
  );

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('PROTECTED');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [hasApplied, setHasApplied] = useState<boolean>(false);

  useEffect(() => {
    if (initialAnimal) {
      setAnimal(initialAnimal);
      setSelectedStatus(initialAnimal.status || 'PROTECTED');
    }
  }, [initialAnimal]);

  // 🐾 로그인 사용자의 해당 동물 입양 신청 중복 여부 확인
  useEffect(() => {
    if (!isAuthenticated || !id) {
      setHasApplied(false);
      return;
    }

    getMyAdoptions()
      .then((adoptions) => {
        const found = adoptions.some((item) => String(item.animalId) === String(id));
        setHasApplied(found);
      })
      .catch((err) => {
        console.warn('내 입양 신청 내역 조회 실패:', err);
      });
  }, [isAuthenticated, id]);

  usePageTitle(animal ? `${animal.breed || animal.species} - 입양 상세 정보` : '동물 상세 정보');

  const isAdmin = isAuthenticated && (user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN');

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteAnimal(id);
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
      await updateAnimalStatus(id, selectedStatus);
      setAnimal((prev) => (prev ? { ...prev, status: selectedStatus } : prev));
      setIsStatusModalOpen(false);
      showToast(`동물 보호 상태가 '${getStatusLabel(selectedStatus)}'(으)로 변경되었습니다.`, 'success');
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

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `[파우메이트] ${animal?.breed || '유기동물'} 평생 가족을 찾고 있어요!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${animal?.breed || '유기동물'}의 입양 상세 정보를 확인해 보세요.`,
          url: shareUrl,
        });
        return;
      } catch {
        // 공유 취소 시 무시
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      showToast('동물 상세 링크가 클립보드에 복사되었습니다!', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      showToast('주소 복사에 실패했습니다. 직접 복사해주세요.', 'error');
    }
  };

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

  const getStatusBanner = (status: string) => {
    if (status === AnimalStatus.PROTECTED) {
      return (
        <div className={`${styles.statusBanner} ${styles.bannerProtected}`}>
          <span className={styles.bannerIcon}><CheckCircle2 size={20} /></span>
          <span className={styles.bannerMessage}>현재 새로운 평생 가족의 입양 신청을 적극 기다리고 있습니다!</span>
        </div>
      );
    }
    if (status === AnimalStatus.WAITING) {
      return (
        <div className={`${styles.statusBanner} ${styles.bannerWaiting}`}>
          <span className={styles.bannerIcon}><Clock size={20} /></span>
          <span className={styles.bannerMessage}>보호소에서 따뜻한 관심과 돌봄을 받으며 대기 중입니다.</span>
        </div>
      );
    }
    if (status === AnimalStatus.ADOPTED) {
      return (
        <div className={`${styles.statusBanner} ${styles.bannerAdopted}`}>
          <span className={styles.bannerIcon}><Sparkles size={20} /></span>
          <span className={styles.bannerMessage}>새로운 보금자리를 찾아 떠났습니다! 많은 축하 부탁드립니다.</span>
        </div>
      );
    }
    return null;
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

  if (error && !animal) return <p className={styles.error}>오류 발생: {error.message}</p>;

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
                aria-label={!isAuthenticated ? '로그인 후 찜하기 가능' : favorite ? '관심 목록에서 제거' : '관심 동물로 등록'}
                aria-pressed={isAuthenticated ? favorite : undefined}
                title={!isAuthenticated ? '로그인 후 찜하기 가능합니다' : favorite ? '관심 목록에서 제거' : '관심 동물로 등록'}
              >
                {!isAuthenticated ? (
                  <><Lock size={15} /> <span>찜하기</span></>
                ) : favorite ? (
                  <><Heart size={16} /> <span>찜됨</span></>
                ) : (
                  <><Heart size={16} /> <span>찜하기</span></>
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

              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.cardIcon}><PawPrint size={20} /></span>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLabel}>종류</span>
                    <span className={styles.cardValue}>
                      {getSpeciesLabel(animal.species)}
                    </span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.cardIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="10" r="8" />
                      <line x1="12" y1="18" x2="12" y2="22" />
                      <line x1="10" y1="20" x2="14" y2="20" />
                    </svg>
                  </span>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLabel}>성별</span>
                    <span className={styles.cardValue}>{getGenderLabel(animal.gender)}</span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.cardIcon}><Calendar size={20} /></span>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLabel}>나이</span>
                    <span className={styles.cardValue}>{Math.max(0, Number(animal.age) || 0)}살</span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.cardIcon}><Palette size={20} /></span>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLabel}>털 색상</span>
                    <span className={styles.cardValue}>{animal.color}</span>
                  </div>
                </div>
              </div>

              {/* 상태에 따른 맞춤 안내 배너 */}
              {getStatusBanner(animal.status)}

              {/* 일반 사용자: 입양 신청 버튼 (중복 신청 방어 분기) */}
              {!isAdmin && canAdopt && (
                <div className={styles.adoptBtnWrapper}>
                  {hasApplied ? (
                    <div className={styles.appliedNoticeCard}>
                      <div className={styles.appliedTitle}>
                        <CheckCircle2 size={20} />
                        <span>이미 입양 신청서가 접수된 아이입니다</span>
                      </div>
                      <p className={styles.appliedText}>
                        현재 보호소에서 신청서를 정성껏 심사 중입니다. 심사 진행 상태는 마이페이지에서 확인하실 수 있습니다.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/mypage')}
                        className={`btn-secondary ${styles.appliedBtn}`}
                      >
                        <ClipboardList size={16} />
                        <span>내 입양 신청 내역 확인하기</span>
                      </button>
                    </div>
                  ) : isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/adopt/${id}`)}
                      className={`btn-primary ${styles.adoptActionBtn}`}
                    >
                      <FileText size={20} />
                      <span>입양 신청서 작성하기</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goToLoginForAdoption}
                      className={`btn-secondary ${styles.adoptActionBtn}`}
                    >
                      <Lock size={18} />
                      <span>로그인 후 입양 신청 가능</span>
                    </button>
                  )}
                </div>
              )}

              {/* 관리자 전용 버튼 */}
              {isAdmin && (
                <div className={styles.adminButtons}>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => setIsStatusModalOpen(true)}
                  >
                    <Edit3 size={16} />
                    <span>상태 변경</span>
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} />
                    <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
                  </button>
                </div>
              )}
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
      <ConfirmModal
        isOpen={isStatusModalOpen}
        title="동물 보호 상태 변경"
        message="변경할 보호 상태를 선택해주세요."
        confirmText={isUpdatingStatus ? '저장 중...' : '상태 변경 저장'}
        cancelText="취소"
        onConfirm={handleStatusChangeSubmit}
        onCancel={() => setIsStatusModalOpen(false)}
      >
        <div className={styles.statusModalContent}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.statusSelect}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </ConfirmModal>

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
