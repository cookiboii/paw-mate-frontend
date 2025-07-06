import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AnimalDetail.module.css';

const AnimalDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  // 로그인하지 않은 사용자는 로그인 페이지로 이동
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchAnimal = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/animals/${id}`);
        if (!response.ok) throw new Error('동물 정보를 불러올 수 없습니다.');
        const data = await response.json();
        setAnimal(data.result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id]);

  if (loading) return <p className={styles.message}>동물 정보를 불러오는 중입니다...</p>;
  if (error) return <p className={styles.error}>오류 발생: {error}</p>;

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
            <p><strong>이름:</strong> {animal.name}</p>
            <p><strong>종:</strong> {animal.species}</p>
            <p><strong>품종:</strong> {animal.breed}</p>
            <p><strong>나이:</strong> {animal.age}살</p>
            <p><strong>성별:</strong> {animal.gender}</p>
            <p><strong>색상:</strong> {animal.color}</p>
            <p><strong>상태:</strong> {animal.status}</p>
          </div>

          {/* 관리자 전용 수정, 삭제 버튼 */}
          {isAdmin && (
            <div className={styles.adminButtons}>
              <Link to={`/animals/edit/${id}`}>
                <button className={styles.editButton}>수정</button>
              </Link>
              <button
                className={styles.deleteButton}
                onClick={() => {
                  // 삭제 로직 함수 호출 등 구현 필요
                  alert('삭제 기능은 구현해야 합니다.');
                }}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className={styles.message}>동물 정보를 찾을 수 없습니다.</p>
      )}

      {isAdmin && (
        <div className={styles.registerBtnWrapper}>
          <Link to="/animals">
            <button className={styles.registerBtn}>동물 관리로 돌아가기</button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default AnimalDetail;
