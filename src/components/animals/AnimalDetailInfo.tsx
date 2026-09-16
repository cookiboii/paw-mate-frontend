import styles from '../../styles/pages/AnimalDetail.module.css';
import { PawPrint, Calendar, Palette } from 'lucide-react';
import type { Animal } from '../../types/animal';
import { getSpeciesLabel, getGenderLabel } from '../../constants/animal';

interface Props {
  animal: Animal;
}

export default function AnimalDetailInfo({ animal }: Props) {
  return (
    <div className={styles.infoGrid}>
      <div className={styles.infoCard}>
        <span className={styles.cardIcon}>
          <PawPrint size={20} />
        </span>
        <div className={styles.cardMeta}>
          <span className={styles.cardLabel}>종류</span>
          <span className={styles.cardValue}>{getSpeciesLabel(animal.species)}</span>
        </div>
      </div>

      <div className={styles.infoCard}>
        <span className={styles.cardIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
        <span className={styles.cardIcon}>
          <Calendar size={20} />
        </span>
        <div className={styles.cardMeta}>
          <span className={styles.cardLabel}>나이</span>
          <span className={styles.cardValue}>{Math.max(0, Number(animal.age) || 0)}살</span>
        </div>
      </div>

      <div className={styles.infoCard}>
        <span className={styles.cardIcon}>
          <Palette size={20} />
        </span>
        <div className={styles.cardMeta}>
          <span className={styles.cardLabel}>털 색상</span>
          <span className={styles.cardValue}>{animal.color}</span>
        </div>
      </div>
    </div>
  );
}
