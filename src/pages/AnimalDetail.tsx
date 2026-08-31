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
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import axios from '../api/axiosInstance';
import styles from '../styles/AnimalDetail.module.css';
import ConfirmModal from '../components/ConfirmModal';
import ImageWithFallback from '../components/ImageWithFallback';
import Skeleton from '../components/Skeleton';
import { AnimalStatus, getGenderLabel, getStatusLabel, getSpeciesLabel } from '../constants/animal';
import usePageTitle from '../hooks/usePageTitle';
import { Animal } from '../types/animal';

const AnimalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  usePageTitle(animal ? `${animal.breed || animal.species} - 입양 상세 정보` : '동물 상세 정보');

  const isAdmin = isAuthenticated && (user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN');

  useEffect(() => {
    const fetchAnimal = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/animals/${id}`);
        const data = res.data.result || res.data;
        setAnimal(data);
      } catch (err) {
        console.warn("백엔드 연결 실패 - 데모 데이터를 로드합니다.", err);
        setAnimal({
          id: id || '1',
          species: "개",
          breed: "골든 리트리버",
          age: 2,
          gender: "MALE",
          color: "크림색 (Cream)",
          status: "PROTECTED",
          image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=1000",
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/animals/delete/${id}`);
      setIsDeleteModalOpen(false);
      showToast('동물 정보가 삭제되었습니다.', 'info');
      setTimeout(() => navigate('/animals'), 800);
    } catch (err: any) {
      showToast('삭제 실패: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFavClick = () => {
    if (!isAuthenticated) {
      showToast('찜하기는 로그인 후 이용할 수 있습니다.', 'info');
      return;
    }
    if (animal) toggleFavorite(animal);
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
      showToast('링크가 클립보드에 복사되었습니다! 원하는 곳에 공유해 보세요.', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      showToast('링크 복사에 실패했습니다.', 'error');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const mapping: Record<string, string> = {
      WAITING: styles.badgeWaiting,
      PROTECTED: styles.badgeProtected,
      ADOPTED: styles.badgeAdopted,
    };
    return `${styles.statusBadge} ${mapping[status] || ""}`;
  };

  const getStatusBanner = (status: string) => {
    if (status === AnimalStatus.PROTECTED) {
      return (
        <div className={`${styles.statusBanner} ${styles.bannerProtected}`}>
          <span className={styles.bannerIcon} style={{ display: 'flex', alignItems: 'center' }}><PawPrint size={20} /></span>
          <span className={styles.bannerMessage}>가족을 맞이할 준비가 되셨나요? 지금 입양 신청해보세요.</span>
        </div>
      );
    }
    if (status === AnimalStatus.WAITING) {
      return (
        <div className={`${styles.statusBanner} ${styles.bannerWaiting}`}>
          <span className={styles.bannerIcon} style={{ display: 'flex', alignItems: 'center' }}><Clock size={20} /></span>
          <span className={styles.bannerMessage}>보호소에서 따뜻한 관심과 돌봄을 받으며 대기 중입니다.</span>
        </div>
      );
    }
    if (status === AnimalStatus.ADOPTED) {
      return (
        <div className={`${styles.statusBanner} ${styles.bannerAdopted}`}>
          <span className={styles.bannerIcon} style={{ display: 'flex', alignItems: 'center' }}><Sparkles size={20} /></span>
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
            <Skeleton type="title" width="60%" height={32} style={{ margin: '16px 0' }} />
            <div className={styles.infoGrid}>
              <Skeleton type="card" height={70} />
              <Skeleton type="card" height={70} />
              <Skeleton type="card" height={70} />
              <Skeleton type="card" height={70} />
            </div>
            <Skeleton type="card" height={50} style={{ margin: '20px 0' }} />
            <Skeleton type="card" height={52} />
          </div>
        </div>
      </section>
    );
  }

  if (error) return <p className={styles.error}>오류 발생: {error}</p>;

  const canAdopt = animal?.status === AnimalStatus.PROTECTED;
  const favorite = animal ? isFavorite(animal.id) : false;

  return (
    <>
      <section className={styles.detailContainer}>
        <div className={styles.topNavigation} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/animals" className={styles.backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} />
            <span>전체 동물 목록으로</span>
          </Link>

          <button
            onClick={handleShare}
            className={styles.shareBtn}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 500,
              transition: 'all var(--transition-fast)'
            }}
            title="링크 복사 및 공유하기"
          >
            {isCopied ? (
              <>
                <Check size={16} color="var(--primary-color)" />
                <span style={{ color: 'var(--primary-color)' }}>링크 복사됨</span>
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
            <div className={styles.imageContainer}>
              <ImageWithFallback
                src={animal.image}
                alt={`${animal.breed || animal.species} 사진`}
                className={styles.image}
                fallbackText="동물 사진 준비 중입니다"
              />
              {/* 찜하기 플로팅 버튼 */}
              <button
                className={`${styles.favBtn} ${favorite ? styles.favActive : ''} ${!isAuthenticated ? styles.favLocked : ''}`}
                onClick={handleFavClick}
                aria-label={!isAuthenticated ? '로그인 후 찜하기 가능' : favorite ? '관심 목록에서 제거' : '관심 동물로 등록'}
                aria-pressed={isAuthenticated ? favorite : undefined}
                title={!isAuthenticated ? '로그인 후 찜하기 가능합니다' : favorite ? '관심 목록에서 제거' : '관심 동물로 등록'}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {!isAuthenticated ? (
                  <><Lock size={15} /> <span>찜하기</span></>
                ) : favorite ? (
                  <><Heart size={16} fill="#ff4d4f" color="#ff4d4f" /> <span>찜됨</span></>
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
                  <span className={styles.cardIcon} style={{ display: 'flex', alignItems: 'center' }}><PawPrint size={20} /></span>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLabel}>종류</span>
                    <span className={styles.cardValue}>
                      {getSpeciesLabel(animal.species)}
                    </span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.cardIcon} style={{ display: 'flex', alignItems: 'center' }}>
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
                  <span className={styles.cardIcon} style={{ display: 'flex', alignItems: 'center' }}><Calendar size={20} /></span>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLabel}>나이</span>
                    <span className={styles.cardValue}>{Math.max(0, Number(animal.age) || 0)}살</span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.cardIcon} style={{ display: 'flex', alignItems: 'center' }}><Palette size={20} /></span>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLabel}>털 색상</span>
                    <span className={styles.cardValue}>{animal.color}</span>
                  </div>
                </div>
              </div>

              {/* 상태에 따른 맞춤 안내 배너 */}
              {getStatusBanner(animal.status)}

              {/* 일반 사용자: 입양 신청 버튼 */}
              {!isAdmin && canAdopt && (
                <div className={styles.adoptBtnWrapper}>
                  {isAuthenticated ? (
                    <button
                      onClick={() => navigate(`/adopt/${id}`)}
                      className="btn-primary"
                      style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <FileText size={20} />
                      <span>입양 신청서 작성하기</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => showToast('입양 신청은 로그인 후 이용할 수 있습니다.', 'info')}
                      className="btn-secondary"
                      style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
                    className={styles.editButton}
                    onClick={() => navigate(`/animals/edit/${id}`)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit3 size={16} />
                    <span>상태 수정</span>
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={isDeleting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
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
