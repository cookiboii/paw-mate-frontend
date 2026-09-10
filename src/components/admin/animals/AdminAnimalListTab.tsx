import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, RotateCcw, PawPrint, ExternalLink, Trash2 } from 'lucide-react';
import styles from '../../../styles/admin/AdminAnimalsPage.module.css';
import Spinner from '../../Spinner';
import EmptyState from '../../EmptyState';
import { Animal } from '../../../types/animal';
import { getSpeciesLabel, getGenderLabel } from '../../../constants/animal';

interface AdminAnimalListTabProps {
  animals: Animal[];
  isLoadingList: boolean;
  onQuickStatusChange: (animalId: number | string, newStatus: string) => Promise<void>;
  onDeleteTarget: (animal: Animal) => void;
  onNavigateRegister: () => void;
}

export const AdminAnimalListTab: React.FC<AdminAnimalListTabProps> = ({
  animals,
  isLoadingList,
  onQuickStatusChange,
  onDeleteTarget,
  onNavigateRegister,
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');
  const [updatingAnimalId, setUpdatingAnimalId] = useState<number | string | null>(null);

  // 목록 필터링
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      // 1. 상태 필터
      if (statusFilter !== 'ALL' && (animal.status || '').toUpperCase() !== statusFilter) {
        return false;
      }
      // 2. 동물 종류 필터
      if (speciesFilter !== 'ALL' && (animal.species || '').toUpperCase() !== speciesFilter) {
        return false;
      }
      // 3. 검색어 필터 (품종, 동물 종류, 색상)
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase().trim();
        const breed = (animal.breed || '').toLowerCase();
        const species = (animal.species || '').toLowerCase();
        const color = (animal.color || '').toLowerCase();
        if (!breed.includes(q) && !species.includes(q) && !color.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [animals, statusFilter, speciesFilter, searchKeyword]);

  const handleResetFilters = () => {
    setSearchKeyword('');
    setStatusFilter('ALL');
    setSpeciesFilter('ALL');
  };

  const handleStatusChange = async (animalId: number | string, newStatus: string) => {
    setUpdatingAnimalId(animalId);
    try {
      await onQuickStatusChange(animalId, newStatus);
    } finally {
      setUpdatingAnimalId(null);
    }
  };

  const renderStatusSelect = (animal: Animal) => {
    const animalId = animal.id ?? animal.animalId;
    const statusKey = (animal.status || 'PROTECTED').toUpperCase();
    const statusClass =
      statusKey === 'PROTECTED'
        ? styles.statusProtected
        : statusKey === 'WAITING'
        ? styles.statusWaiting
        : styles.statusAdopted;
    const isUpdating = updatingAnimalId === animalId;

    return (
      <div className={styles.statusControl} aria-busy={isUpdating}>
      <select
        className={`${styles.statusSelect} ${statusClass}`}
        value={statusKey}
        onChange={(e) => animalId && handleStatusChange(animalId, e.target.value)}
        disabled={isUpdating}
        aria-label={`${animal.name || animal.breed || '보호 동물'} 보호 상태 변경`}
      >
        <option value="PROTECTED">보호 중</option>
        <option value="WAITING">입양 대기</option>
        <option value="ADOPTED">입양 완료</option>
      </select>
        {isUpdating && <span className={styles.statusUpdating}>변경 중...</span>}
      </div>
    );
  };

  return (
    <>
      {/* 검색 및 필터 컨트롤 바 */}
      <div className={styles.filterRow}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <Search size={16} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="품종, 동물 종류, 색상 검색"
            aria-label="보호 동물 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <div className={styles.filterChips}>
          {/* 보호 상태 필터 */}
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">전체 상태</option>
            <option value="PROTECTED">보호중</option>
            <option value="WAITING">대기중</option>
            <option value="ADOPTED">입양완료</option>
          </select>

          {/* 동물 종류 필터 */}
          <select
            className={styles.filterSelect}
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
          >
            <option value="ALL">전체 동물 종류</option>
            <option value="DOG">강아지</option>
            <option value="CAT">고양이</option>
            <option value="ETC">기타</option>
          </select>

          {(searchKeyword || statusFilter !== 'ALL' || speciesFilter !== 'ALL') && (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleResetFilters}
              title="필터 초기화"
              aria-label="필터 초기화"
            >
              <RotateCcw size={15} />
              <span className={styles.resetLabel}>초기화</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.resultSummary} role="status" aria-live="polite">
        전체 <strong>{animals.length}</strong>마리 · 검색 결과 <strong>{filteredAnimals.length}</strong>마리
      </div>

      {/* 동물 목록 테이블 */}
      <div className={styles.tableCard}>
        {isLoadingList ? (
          <div className={styles.tableLoading}>
            <Spinner />
          </div>
        ) : filteredAnimals.length === 0 ? (
          <div className={styles.tableEmpty}>
            <EmptyState
              icon={<PawPrint size={48} />}
              title="조건에 맞는 보호 동물이 없습니다."
              description="검색어나 필터 조건을 변경해 보세요."
              actionLabel="신규 동물 등록하기"
              onAction={onNavigateRegister}
            />
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>동물 정보</th>
                  <th>동물 종류 / 성별 / 나이</th>
                  <th>색상</th>
                  <th>보호 상태 (원클릭 변경)</th>
                  <th className={styles.textRight}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.map((animal) => {
                  const animalId = animal.id ?? animal.animalId;

                  return (
                    <tr key={animalId}>
                      <td>
                        <div className={styles.animalCell}>
                          <img
                            src={animal.image || animal.profileImageUrl || animal.imageUrl || '/default-pet.png'}
                            alt={animal.breed || '반려동물'}
                            className={styles.thumbnail}
                          />
                          <div>
                            <span className={styles.animalBreed}>{animal.name || animal.breed || '이름 없음'}</span>
                            {animal.name && animal.breed && animal.name !== animal.breed && (
                              <span className={styles.animalMeta}>{animal.breed}</span>
                            )}
                            <span className={styles.animalMeta}>ID: #{animalId}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{getSpeciesLabel(animal.species)}</strong> • {getGenderLabel(animal.gender)}
                        </div>
                        <span className={styles.animalMeta}>{animal.age}살</span>
                      </td>
                      <td>{animal.color || '-'}</td>
                      <td>
                        {renderStatusSelect(animal)}
                      </td>
                      <td className={styles.textRight}>
                        <div className={`${styles.actionCell} ${styles.actionCellEnd}`}>
                          <Link
                            to={`/animals/${animalId}`}
                            className={styles.iconBtn}
                            title="일반 상세 페이지 보기"
                            aria-label={`${animal.name || animal.breed || '보호 동물'} 상세 페이지 보기`}
                          >
                            <ExternalLink size={16} />
                          </Link>
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            onClick={() => onDeleteTarget(animal)}
                            title="동물 삭제"
                            aria-label={`${animal.name || animal.breed || '보호 동물'} 삭제`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoadingList && filteredAnimals.length > 0 && (
          <div className={styles.mobileCardList}>
            {filteredAnimals.map((animal) => {
              const animalId = animal.id ?? animal.animalId;
              return (
                <article className={styles.mobileAnimalCard} key={`mobile-${animalId}`}>
                  <div className={styles.mobileCardHeader}>
                    <img
                      src={animal.image || animal.profileImageUrl || animal.imageUrl || '/default-pet.png'}
                      alt=""
                      className={styles.thumbnail}
                    />
                    <div className={styles.mobileCardIdentity}>
                      <strong>{animal.name || animal.breed || '이름 없음'}</strong>
                      <span>{animal.breed || getSpeciesLabel(animal.species)} · ID #{animalId}</span>
                    </div>
                    <Link
                      to={`/animals/${animalId}`}
                      className={styles.iconBtn}
                      aria-label={`${animal.name || animal.breed || '보호 동물'} 상세 페이지 보기`}
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                  <dl className={styles.mobileDetails}>
                    <div><dt>동물 종류</dt><dd>{getSpeciesLabel(animal.species)}</dd></div>
                    <div><dt>성별·나이</dt><dd>{getGenderLabel(animal.gender)} · {animal.age}살</dd></div>
                    <div><dt>색상</dt><dd>{animal.color || '-'}</dd></div>
                  </dl>
                  <div className={styles.mobileCardActions}>
                    {renderStatusSelect(animal)}
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      onClick={() => onDeleteTarget(animal)}
                      aria-label={`${animal.name || animal.breed || '보호 동물'} 삭제`}
                    >
                      <Trash2 size={16} />
                      <span>삭제</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminAnimalListTab;
