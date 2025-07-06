import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/AnimalStatusEditPage.module.css';

// ✅ 백엔드 Enum 값과 매핑되는 선택지
const STATUS_OPTIONS = [
  { label: '대기중', value: 'WAITING' },
  { label: '보호중', value: 'PROTECTED' },
  { label: '입양완료', value: 'ADOPTED' },
];

const AnimalStatusEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  useEffect(() => {
    const fetchAnimalStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/animals/${id}`);
        if (!res.ok) throw new Error('동물 정보를 불러올 수 없습니다.');
        const data = await res.json();
        setStatus(data.result.status); // status: WAITING, PROTECTED, ADOPTED 중 하나
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimalStatus();
  }, [id]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:8000/animals/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }), // ✅ Enum 문자열 그대로 전송
      });

      if (!res.ok) throw new Error('상태 수정 실패');
      alert('✅ 상태가 성공적으로 수정되었습니다.');
      navigate(`/animals/${id}`);
    } catch (err) {
      alert('❌ 수정 실패: ' + err.message);
    }
  };

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>오류 발생: {error}</p>;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>동물 상태 수정</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <select
          value={status}
          onChange={handleStatusChange}
          className={styles.select}
          required
        >
          <option value="">상태 선택</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.button}>
          상태 변경
        </button>
      </form>
    </section>
  );
};

export default AnimalStatusEditPage;
