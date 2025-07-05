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
    <div className={styles.container}>
      <h2 className={styles.title}>등록된 유기동물 목록</h2>
      <ul className={styles.list}>
        {animals.map((animal) => (
          <li key={animal.id} className={styles.card}>
            <Link to={`/animals/${animal.id}`}>
              <img src={animal.image || '/default-animal.jpg'} alt={animal.species} />
              <div className={styles.info}>
                <p><strong>종:</strong> {animal.species}</p>
                <p><strong>품종:</strong> {animal.breed}</p>
                <p><strong>나이:</strong> {animal.age}살</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.pagination}>
        <button onClick={prevPage} disabled={page === 0}>이전</button>
        <span>{page + 1} / {totalPages}</span>
        <button onClick={nextPage} disabled={page + 1 === totalPages}>다음</button>
      </div>
    </div>
  );
};

export default AnimalList;
