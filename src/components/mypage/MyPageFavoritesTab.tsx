import styles from '../../styles/pages/MyPage.module.css';
import { Link } from 'react-router-dom';
import { Heart, PawPrint } from 'lucide-react';
import AnimalCard from '../AnimalCard';
import type { Animal } from '../../types/animal';

interface Props {
  favorites: Partial<Animal>[];
  toggleFavorite: (animal: Partial<Animal> & { id: string | number }) => Promise<void>;
}

export default function MyPageFavoritesTab({
  favorites,
  toggleFavorite,
}: Props) {
  return (
    <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardHeaderTitle}>
                      <Heart size={20} className={styles.favHeaderIcon} />
                      <span>관심 동물 목록 ({favorites.length})</span>
                    </h3>
                    <p>찜해둔 아이들을 확인하고 입양 신청서를 작성해 보세요.</p>
                  </div>
                  <div className={styles.cardBody}>
                    {favorites.length === 0 ? (
                      <div className={styles.emptyState}>
                        <span className={styles.centerIcon}><PawPrint size={40} /></span>
                        <p>아직 관심 동물로 등록한 아이가 없습니다.</p>
                        <Link to="/animals" className={`btn-primary ${styles.emptyStateLink}`}>
                          동물 둘러보기
                        </Link>
                      </div>
                    ) : (
                      <div className={styles.favoritesGrid}>
                        {favorites.map((animal) => {
                          const favId = animal.id ?? (animal as { animalId?: string | number }).animalId;
                          if (!favId) return null;
                          return (
                            <AnimalCard
                              key={favId}
                              animal={animal}
                              showStatus
                              onRemove={() => toggleFavorite({ ...animal, id: favId })}
                            />
                          );
                        })}
                      </div>

                    )}
                  </div>
                </section>
  );
}
