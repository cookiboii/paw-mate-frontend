import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/AnimalList.module.css';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useFavorites } from '../context/FavoritesContext';
import axios from '../api/axiosInstance';

const AnimalList = () => {
  const [animals, setAnimals] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // 필터 및 검색 상태
  const [speciesFilter, setSpeciesFilter] = useState('ALL'); // 'ALL', '강아지', '고양이', '기타'
  const [genderFilter, setGenderFilter] = useState('ALL'); // 'ALL', 'MALE', 'FEMALE'
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const pageSize = 6;

  useEffect(() => {
    const fetchAnimals = async () => {
      setIsLoading(true);
      try {
        let res;
        // 📌 API 명세서 반영:
        // 전체 조회: GET /animals/list?page=0&size=10
        // 종별 조회: GET /animals/species?species={species}&page=0&size=10
        if (speciesFilter === 'ALL') {
          res = await axios.get(`/animals/list?page=${page}&size=${pageSize}`);
        } else {
          res = await axios.get(`/animals/species?species=${encodeURIComponent(speciesFilter)}&page=${page}&size=${pageSize}`);
        }
        
        const pageData = res.data.result || res.data;
        setAnimals(pageData.content || []);
        setTotalPages(pageData.totalPages || 1);
      } catch (err) {
        console.error('동물 목록 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimals();
  }, [page, speciesFilter]);

  // 프론트엔드 다중 필터링 (검색어 + 성별)
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      // 1. 성별 필터
      if (genderFilter !== 'ALL') {
        const g = (animal.gender || '').toUpperCase();
        if (genderFilter === 'MALE' && !(g === 'M' || g === 'MALE')) return false;
        if (genderFilter === 'FEMALE' && !(g === 'F' || g === 'FEMALE')) return false;
      }
      // 2. 검색어 필터 (품종, 색상, 종)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const breed = (animal.breed || '').toLowerCase();
        const species = (animal.species || '').toLowerCase();
        const color = (animal.color || '').toLowerCase();
        if (!breed.includes(q) && !species.includes(q) && !color.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [animals, genderFilter, searchQuery]);

  const handleSpeciesChange = (type) => {
    setSpeciesFilter(type);
    setPage(0);
  };

  const prevPage = () => setPage((p) => Math.max(p - 1, 0));
  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>가족을 기다리는 아이들</h2>
        <p className={styles.subtitle}>새로운 세상을 선물해 줄 따뜻한 손길을 기다립니다.</p>
      </div>

      {/* 검색 및 다중 필터 섹션 */}
      <div className={styles.filterSection}>
        <div className={styles.searchBarWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="품종, 색상 등으로 검색 (예: 푸들, 흰색)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        <div className={styles.filterControls}>
          {/* 종 필터 (신규 /animals/species 엔드포인트 연동: DOG, CAT, ETC) */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>종:</span>
            {[
              { key: 'ALL', label: '전체' },
              { key: 'DOG', label: '강아지 🐶' },
              { key: 'CAT', label: '고양이 🐱' },
              { key: 'ETC', label: '기타 🐾' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`${styles.filterChip} ${speciesFilter === key ? styles.activeChip : ''}`}
                onClick={() => handleSpeciesChange(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 성별 필터 */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>성별:</span>
            {[
              { key: 'ALL', label: '전체' },
              { key: 'MALE', label: '수컷 ♂' },
              { key: 'FEMALE', label: '암컷 ♀' }
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`${styles.filterChip} ${genderFilter === key ? styles.activeChip : ''}`}
                onClick={() => setGenderFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className={styles.container}>
        {isLoading ? (
          <ul className={styles.list}>
            {Array.from({ length: pageSize }).map((_, index) => (
              <li key={`skeleton-${index}`} className={styles.card}>
                <Skeleton type="rect" height="240px" />
                <div className={styles.info}>
                  <Skeleton type="title" width="60%" height="24px" />
                  <Skeleton type="text" width="40%" height="16px" />
                </div>
              </li>
            ))}
          </ul>
        ) : filteredAnimals.length === 0 ? (
          <EmptyState 
            icon="🐕"
            title="조건에 맞는 아이가 없습니다."
            description="현재 조건에 부합하는 유기동물이 없습니다. 검색어나 필터를 변경해 보세요."
          />
        ) : (
          <ul className={styles.list}>
            {filteredAnimals.map((animal) => {
              const favorite = isFavorite(animal.id);
              return (
                <li key={animal.id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <Link to={`/animals/${animal.id}`} className={styles.imageLink}>
                      <img 
                        src={animal.image || '/default-animal.jpg'} 
                        alt={animal.species}
                        loading="lazy"
                        className={styles.lazyImage}
                        onLoad={(e) => e.target.classList.add(styles.loaded)}
                      />
                    </Link>
                    <span className={styles.badge}>
                      {animal.species === 'DOG' ? '강아지 🐶' : animal.species === 'CAT' ? '고양이 🐱' : animal.species === 'ETC' ? '기타 🐾' : animal.species}
                    </span>
                    
                    {/* 찜하기(하트) 버튼 */}
                    <button
                      className={`${styles.favBtn} ${favorite ? styles.favActive : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(animal);
                      }}
                      aria-label="관심 동물 찜하기"
                      title={favorite ? "관심 목록에서 제거" : "관심 동물로 등록"}
                    >
                      {favorite ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div className={styles.info}>
                    <Link to={`/animals/${animal.id}`}>
                      <h3 className={styles.breed}>{animal.breed}</h3>
                    </Link>
                    <div className={styles.meta}>
                      <span>{Math.max(0, Number(animal.age) || 0)}살</span>
                      <span className={styles.dot}>•</span>
                      <span>{animal.gender === 'M' || animal.gender === 'MALE' ? '수컷' : animal.gender === 'F' || animal.gender === 'FEMALE' ? '암컷' : '성별미상'}</span>
                      {animal.color && (
                        <>
                          <span className={styles.dot}>•</span>
                          <span>{animal.color}</span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        
        {/* 페이지네이션 */}
        <div className={styles.pagination}>
          <button onClick={prevPage} disabled={page === 0} className={styles.pageBtn}>이전</button>
          <span className={styles.pageInfo}>{page + 1} <span className={styles.pageTotal}>/ {totalPages || 1}</span></span>
          <button onClick={nextPage} disabled={page + 1 >= totalPages} className={styles.pageBtn}>다음</button>
        </div>
      </div>
    </div>
  );
};

export default AnimalList;
