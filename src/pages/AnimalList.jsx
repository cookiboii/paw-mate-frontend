import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/AnimalList.module.css';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

const AnimalList = () => {
  const [animals, setAnimals] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', '개', '고양이', '기타'
  const pageSize = 5;

  useEffect(() => {
    const fetchAnimals = async () => {
      setIsLoading(true);
      try {
        let url = `${API_BASE_URL}/animals/list?page=${page}&size=${pageSize}`;
        // Note: Assuming backend supports species filtering. If not, it will just return all.
        if (filter !== 'ALL') {
          url += `&species=${encodeURIComponent(filter)}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('동물 목록을 불러오지 못했습니다.');
        const data = await res.json();
        setAnimals(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimals();
  }, [page, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(0); // Reset page when filter changes
  };

  const prevPage = () => setPage((p) => Math.max(p - 1, 0));
  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>가족을 기다리는 아이들</h2>
        <p className={styles.subtitle}>새로운 세상을 선물해 줄 따뜻한 손길을 기다립니다.</p>
      </div>

      <div className={styles.filterContainer}>
        {['ALL', '개', '고양이', '기타'].map(type => (
          <button
            key={type}
            className={`${styles.filterChip} ${filter === type ? styles.activeChip : ''}`}
            onClick={() => handleFilterChange(type)}
          >
            {type === 'ALL' ? '전체' : type}
          </button>
        ))}
      </div>
      
      <div className={styles.container}>
        {isLoading ? (
          <ul className={styles.list}>
            {Array.from({ length: pageSize }).map((_, index) => (
              <li key={`skeleton-${index}`} className={styles.card}>
                <Skeleton type="rect" />
                <div className={styles.info}>
                  <Skeleton type="title" width="60%" />
                  <Skeleton type="text" width="40%" />
                </div>
              </li>
            ))}
          </ul>
        ) : animals.length === 0 ? (
          <EmptyState 
            icon="🐕"
            title="조건에 맞는 아이가 없습니다."
            description="현재 보호소에 해당 조건의 유기동물이 없습니다. 다른 조건을 검색해보세요."
          />
        ) : (
          <ul className={styles.list}>
            {animals.map((animal) => (
              <li key={animal.id} className={styles.card}>
                <Link to={`/animals/${animal.id}`}>
                  <div className={styles.imageWrapper}>
                    <img 
                      src={animal.image || '/default-animal.jpg'} 
                      alt={animal.species}
                      loading="lazy"
                      className={styles.lazyImage}
                      onLoad={(e) => e.target.classList.add(styles.loaded)}
                    />
                    <span className={styles.badge}>{animal.species}</span>
                  </div>
                  <div className={styles.info}>
                    <h3 className={styles.breed}>{animal.breed}</h3>
                    <div className={styles.meta}>
                      <span>{Math.max(0, Number(animal.age) || 0)}살</span>
                      <span className={styles.dot}>•</span>
                      <span>{animal.gender === 'M' ? '수컷' : animal.gender === 'F' ? '암컷' : '성별미상'}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        
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
