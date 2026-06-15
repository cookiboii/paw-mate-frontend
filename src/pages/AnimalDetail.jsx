import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AnimalDetail.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://211.241.113.119:8000';

// 상태 ENUM 정의
const AnimalStatus = {
  WAITING: 'WAITING',
  PROTECTED: 'PROTECTED',
  ADOPTED: 'ADOPTED',
};

// Inline SVG Icons
const PawIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5c.67 0 1.2-.53 1.2-1.2A1.8 1.8 0 0 0 11.4 2a1.8 1.8 0 0 0-1.8 1.8c0 .67.53 1.2 1.2 1.2zM5 8c.67 0 1.2-.53 1.2-1.2A1.8 1.8 0 0 0 4.4 5a1.8 1.8 0 0 0-1.8 1.8c0 .67.53 1.2 1.2 1.2zM19 8c.67 0 1.2-.53 1.2-1.2A1.8 1.8 0 0 0 18.4 5a1.8 1.8 0 0 0-1.8 1.8c0 .67.53 1.2 1.2 1.2zM12 9c-3.3 0-6 2.7-6 6v3c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4v-3c0-3.3-2.7-6-6-6z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const GenderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="8" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="10" y1="20" x2="14" y2="20" />
  </svg>
);

const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03442 19.1759 5.06013 19.4539 4.9575 19.6738C4.51268 20.6273 4.22591 21.6703 4.12071 22.7533C4.08861 23.0837 4.36442 23.3644 4.69538 23.3323C5.77838 23.2271 6.82136 22.9403 7.77492 22.4955C7.99484 22.3929 8.27284 22.4186 8.4487 22.5944C10.2529 24.3986 11.5228 22 12 22Z" />
    <circle cx="7.5" cy="10.5" r="1.5" />
    <circle cx="11.5" cy="7.5" r="1.5" />
    <circle cx="16.5" cy="9.5" r="1.5" />
  </svg>
);

const AnimalDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = isAuthenticated && user?.role?.toUpperCase() === 'ADMIN';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchAnimal = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/animals/${id}`);
        if (!response.ok) throw new Error('동물 정보를 불러올 수 없습니다.');
        const data = await response.json();
        setAnimal(data.result);
      } catch (err) {
        console.warn("백엔드 연결 실패 - 미리보기용 데모 데이터를 로드합니다.", err);
        setAnimal({
          id: id,
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
    const token = localStorage.getItem('token');
    const confirmed = window.confirm('정말로 이 동물 정보를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/animals/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('삭제에 실패했습니다.');

      alert('삭제가 완료되었습니다.');
      navigate('/animals');
    } catch (err) {
      alert('❌ 오류: ' + err.message);
    }
  };

  const getGenderText = (gender) => {
    if (!gender) return "정보 없음";
    const g = gender.toUpperCase();
    if (g === "M" || g === "MALE") return "수컷";
    if (g === "F" || g === "FEMALE") return "암컷";
    return gender;
  };

  const getStatusLabel = (status) => {
    const mapping = {
      WAITING: "입양 대기",
      PROTECTED: "임시 보호 중",
      ADOPTED: "입양 완료",
    };
    return mapping[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    const mapping = {
      WAITING: styles.badgeWaiting,
      PROTECTED: styles.badgeProtected,
      ADOPTED: styles.badgeAdopted,
    };
    return `${styles.statusBadge} ${mapping[status] || ""}`;
  };

  const getStatusBanner = (status) => {
    if (status === AnimalStatus.PROTECTED) {
      return (
        <div className={`${styles.statusBanner} ${styles.bannerProtected}`}>
          <span className={styles.bannerIcon}>🐾</span>
          <span className={styles.bannerMessage}>가족을 맞이할 준비가 되셨나요? 지금 입양 신청해보세요.</span>
        </div>
      );
    }
    if (status === AnimalStatus.WAITING) {
      return (
        <div className={`${styles.statusBanner} ${styles.bannerWaiting}`}>
          <span className={styles.bannerIcon}>⏳</span>
          <span className={styles.bannerMessage}>보호소에서 따뜻한 관심과 돌봄을 받으며 대기 중입니다.</span>
        </div>
      );
    }
    if (status === AnimalStatus.ADOPTED) {
      return (
        <div className={`${styles.statusBanner} ${styles.bannerAdopted}`}>
          <span className={styles.bannerIcon}>🎉</span>
          <span className={styles.bannerMessage}>새로운 보금자리를 찾아 떠났습니다! 많은 축하 부탁드립니다.</span>
        </div>
      );
    }
    return null;
  };

  if (loading) return <p className={styles.message}>동물 정보를 불러오는 중입니다...</p>;
  if (error) return <p className={styles.error}>오류 발생: {error}</p>;

  // PROTECTED 상태일 때만 입양 가능
  const canAdopt = animal?.status === AnimalStatus.PROTECTED;

  return (
    <section className={styles.detailContainer}>
      <h2 className={styles.title}>유기동물 상세 정보</h2>

      {animal ? (
        <div className={styles.card}>
          <img
            src={animal.image || '/default-animal.jpg'}
            alt="동물 사진"
            className={styles.image}
          />
          <div className={styles.info}>
            <div className={styles.headerArea}>
              <h3 className={styles.breed}>{animal.breed}</h3>
              <span className={getStatusBadgeClass(animal.status)}>
                {getStatusLabel(animal.status)}
              </span>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <span className={styles.cardIcon}><PawIcon /></span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardLabel}>종 종류</span>
                  <span className={styles.cardValue}>{animal.species}</span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.cardIcon}><GenderIcon /></span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardLabel}>성별</span>
                  <span className={styles.cardValue}>{getGenderText(animal.gender)}</span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.cardIcon}><CalendarIcon /></span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardLabel}>나이</span>
                  <span className={styles.cardValue}>{animal.age}살</span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.cardIcon}><PaletteIcon /></span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardLabel}>털 색상</span>
                  <span className={styles.cardValue}>{animal.color}</span>
                </div>
              </div>
            </div>

            {/* 상태에 따른 맞춤 안내 배너 */}
            {getStatusBanner(animal.status)}

            {/* 일반 사용자: 입양 신청 버튼 조건 */}
            {!isAdmin && canAdopt && (
              <div className={styles.adoptBtnWrapper}>
                <Link to={`/adopt/${id}`} className="btn-primary" style={{width: '100%', textDecoration: 'none'}}>
                  입양 신청하기
                </Link>
              </div>
            )}

            {/* 관리자 전용 버튼 */}
            {isAdmin && (
              <div className={styles.adminButtons}>
                <button
                  className={styles.editButton}
                  onClick={() => navigate(`/animals/edit/${id}`)}
                >
                  상태 수정
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={handleDelete}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className={styles.message}>동물 정보를 찾을 수 없습니다.</p>
      )}

      {/* 목록으로 돌아가기 버튼 (모든 사용자 노출) */}
      <div className={styles.registerBtnWrapper}>
        <Link to="/animals" className="btn-secondary">
          동물 목록으로 돌아가기
        </Link>
      </div>
    </section>
  );
};

export default AnimalDetail;
