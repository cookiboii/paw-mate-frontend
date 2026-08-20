import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from '../../api/axiosInstance';
import styles from '../../styles/AnimalStatusEditPage.module.css';

const STATUS_OPTIONS = [
  { label: '대기중 (WAITING)', value: 'WAITING' },
  { label: '임시보호중 (PROTECTED)', value: 'PROTECTED' },
  { label: '입양완료 (ADOPTED)', value: 'ADOPTED' },
];

const AnimalStatusEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [status, setStatus] = useState('');
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = isAuthenticated && (user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN');

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  useEffect(() => {
    const fetchAnimalStatus = async () => {
      try {
        const res = await axios.get(`/animals/${id}`);
        const data = res.data.result || res.data;
        setAnimal(data);
        setStatus(data.status);
      } catch (err) {
        showToast('동물 정보를 불러오지 못했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimalStatus();
  }, [id, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 📌 Body: AnimalStatusUpdateRequest { status }
      await axios.put(`/animals/${id}/status`, { status });
      showToast('✅ 동물 상태가 성공적으로 변경되었습니다.', 'success');
      navigate(`/animals/${id}`);
    } catch (err) {
      showToast('상태 수정 실패: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  if (loading) return <div className={styles.container}><p>불러오는 중...</p></div>;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>🐾 동물 보호 상태 변경</h2>
      {animal && (
        <p style={{textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px'}}>
          <strong>{animal.breed}</strong> (#{animal.id})의 현재 상태를 변경합니다.
        </p>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.select}
          required
        >
          <option value="" disabled>상태 선택</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '16px'}}>
          상태 변경 완료
        </button>
      </form>
    </section>
  );
};

export default AnimalStatusEditPage;
