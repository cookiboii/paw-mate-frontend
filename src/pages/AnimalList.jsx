import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/AnimalList.module.css';

const AnimalList = () => {
  const [animals, setAnimals] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const res = await fetch(`http://localhost:8000/animals/list?page=${page}&size=${pageSize}`);
        if (!res.ok) throw new Error('동물 목록을 불러오지 못했습니다.');
        const data = await res.json();
        setAnimals(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnimals();
  }, [page]);

  const prevPage = () => setPage((p) => Math.max(p - 1, 0));
  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>가족을 기다리는 아이들</h2>
        <p className={styles.subtitle}>새로운 세상을 선물해 줄 따뜻한 손길을 기다립니다.</p>
      </div>
      
      <div className={styles.container}>
        {animals.length === 0 ? (
          <div className={styles.emptyState}>등록된 유기동물이 없습니다.</div>
        ) : (
          <ul className={styles.list}>
            {animals.map((animal) => (
              <li key={animal.id} className={styles.card}>
                <Link to={`/animals/${animal.id}`}>
                  <div className={styles.imageWrapper}>
                    <img src={animal.image || '/default-animal.jpg'} alt={animal.species} />
                    <span className={styles.badge}>{animal.species}</span>
                  </div>
                  <div className={styles.info}>
                    <h3 className={styles.breed}>{animal.breed}</h3>
                    <div className={styles.meta}>
                      <span>{animal.age}살</span>
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
