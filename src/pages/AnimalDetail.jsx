import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AnimalDetail.module.css';

const AnimalDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

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

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    const confirmed = window.confirm('정말로 이 동물 정보를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:8000/animals/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('삭제에 실패했습니다.');

      alert('삭제가 완료되었습니다.');
      navigate('/animals');
    } catch (err) {
      alert('❌ 오류: ' + err.message);
    }
  };

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
            <p><strong>종:</strong> {animal.species}</p>
            <p><strong>품종:</strong> {animal.breed}</p>
            <p><strong>나이:</strong> {animal.age}살</p>
            <p><strong>성별:</strong> {animal.gender}</p>
            <p><strong>색상:</strong> {animal.color}</p>
            <p><strong>상태:</strong> {animal.status}</p>
          </div>

          {isAdmin && (
            <div className={styles.adminButtons}>
              <Link to={`/animals/edit/${id}`}>
                <button className={styles.editButton}>수정</button>
              </Link>
              <button
                className={styles.deleteButton}
                onClick={handleDelete}
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
