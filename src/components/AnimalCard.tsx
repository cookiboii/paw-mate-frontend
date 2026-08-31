import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Lock, X } from 'lucide-react';
import styles from '../styles/AnimalCard.module.css';
import ImageWithFallback from './ImageWithFallback';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { Animal } from '../types/animal';
import { getGenderLabel, getSpeciesLabel, getStatusLabel } from '../constants/animal';

interface AnimalCardProps {
  animal: Animal | Partial<Animal>;
  showStatus?: boolean;
  extraBadgeText?: string;
  onRemove?: () => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  showStatus = false,
  extraBadgeText,
  onRemove,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [isBouncing, setIsBouncing] = useState(false);

  const animalId = animal.id ?? animal.animalId;
  const favorite = animalId ? isFavorite(animalId) : false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onRemove) {
      onRemove();
      return;
    }

    if (animalId) {
      setIsBouncing(true);
      toggleFavorite({
        ...animal,
        id: animalId,
      });
      setTimeout(() => setIsBouncing(false), 500);
    }
  };

  const age = Math.max(0, Number(animal.age) || 0);
  const gender = animal.gender || '';
  const isMale = gender.toUpperCase() === 'M' || gender.toUpperCase() === 'MALE';
  const isFemale = gender.toUpperCase() === 'F' || gender.toUpperCase() === 'FEMALE';

  const statusKey = (animal.status || '').toUpperCase();
  const statusClass =
    statusKey === 'PROTECTED'
      ? styles.statusProtected
      : statusKey === 'WAITING'
      ? styles.statusWaiting
      : styles.statusAdopted;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Link to={`/animals/${animalId}`} className={styles.imageLink}>
          <ImageWithFallback
            src={animal.image || animal.profileImageUrl || animal.imageUrl}
            alt={`${animal.breed || animal.species || '반려동물'} - ${getGenderLabel(gender)} ${age}살`}
            className={styles.image}
            fallbackText="사진 준비 중"
          />
        </Link>

        {/* 배지 그룹 */}
        <div className={styles.badgeGroup}>
          {extraBadgeText && <span className={styles.speciesBadge}>{extraBadgeText}</span>}
          {animal.species && (
            <span className={styles.speciesBadge}>{getSpeciesLabel(animal.species)}</span>
          )}
          {showStatus && animal.status && (
            <span className={`${styles.statusBadge} ${statusClass}`}>
              {getStatusLabel(animal.status)}
            </span>
          )}
        </div>

        {/* 찜하기(하트) 버튼 */}
        <button
          type="button"
          className={`${styles.favBtn} ${favorite || isBouncing ? styles.favActive : ''} ${
            !isAuthenticated ? styles.favLocked : ''
          }`}
          onClick={handleFavoriteClick}
          aria-label={
            onRemove
              ? '관심 목록에서 삭제'
              : !isAuthenticated
              ? '로그인 후 찜하기 가능'
              : favorite
              ? '관심 목록에서 제거'
              : '관심 동물로 등록'
          }
          aria-pressed={isAuthenticated ? favorite : undefined}
          title={
            onRemove
              ? '관심 목록에서 제거'
              : !isAuthenticated
              ? '로그인 후 찜하기 가능합니다'
              : favorite
              ? '관심 목록에서 제거'
              : '관심 동물로 등록'
          }
        >
          {onRemove ? (
            <X size={16} />
          ) : !isAuthenticated ? (
            <Lock size={15} />
          ) : (
            <Heart size={18} fill={favorite ? '#ff4d4f' : 'none'} color={favorite ? '#ff4d4f' : 'currentColor'} />
          )}
        </button>
      </div>

      <div className={styles.info}>
        <Link to={`/animals/${animalId}`} className={styles.titleLink}>
          <h3 className={styles.breed}>{animal.breed || animal.name || animal.species || '이름 없음'}</h3>
        </Link>
        <div className={styles.meta}>
          <span>{age}살</span>
          <span className={styles.dot}>•</span>
          <span
            className={`${styles.genderTag} ${
              isMale ? styles.genderMale : isFemale ? styles.genderFemale : ''
            }`}
          >
            {getGenderLabel(gender)}
          </span>
          {animal.color && (
            <>
              <span className={styles.dot}>•</span>
              <span>{animal.color}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AnimalCard);
