import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AnimalDetail.module.css'; // 새 스타일 파일 추가 (예시)

const AnimalDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [animal, setAnimal] = useState(null);

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  // ✅ API 연동 (예시)
  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const response = await fetch(`animals/`);
        const data = await response.json();
        setAnimal(data.result); // 백엔드 응답 구조에 따라 수정
      } catch (err) {
        console.error('동물 정보를 불러오는 데 실패했습니다.', err);
      }
    };

    fetchAnimal();
  }, [id]);

  return (
    <section className={styles.detailContainer}>
      <h2 className={styles.title}>유기동물 상세 정보</h2>

      {animal ? (
        <div className={styles.card}>
          <img
            src={animal.imageUrl || '/default-animal.jpg'}
            alt="동물 사진"
            className={styles.image}
          />
          <div className={styles.info}>
            <p><strong>종:</strong> {animal.species}</p>
            <p><strong>품종:</strong> {animal.breed}</p>
            <p><strong>나이:</strong> {animal.age}살</p>
            <p><strong>성별:</strong> {animal.gender}</p>
            <p><strong>색상:</strong> {animal.color}</p>
            <p><strong>상태:</strong> {animal.status}</p>
          </div>
        </div>
      ) : (
        <p>동물 정보를 불러오는 중입니다...</p>
      )}

      {isAdmin && (
        <div className={styles.registerBtnWrapper}>
          <Link to="/animal/register">
            <button className={styles.registerBtn}>동물 등록</button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default AnimalDetail;
