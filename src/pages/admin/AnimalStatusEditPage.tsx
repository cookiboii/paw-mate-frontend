import React, { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from '../../api/axiosInstance';
import styles from '../../styles/AnimalStatusEditPage.module.css';
import Spinner from '../../components/Spinner';
import { STATUS_OPTIONS } from '../../constants/animal';
import usePageTitle from '../../hooks/usePageTitle';
import { Animal } from '../../types/animal';
import { Edit3 } from 'lucide-react';

const AnimalStatusEditPage: React.FC = () => {
  usePageTitle('동물 보호 상태 변경 (Admin)');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [status, setStatus] = useState<string>('');
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin =
    isAuthenticated &&
    (user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN');

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  useEffect(() => {
    const fetchAnimalStatus = async () => {
      try {
        const res = await axios.get(`/animals/${id}`);
        const data = res.data.result || res.data;
        setAnimal(data);
        setStatus(data.status);
      } catch {
        showToast('동물 정보를 불러오지 못했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimalStatus();
  }, [id, showToast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // 📌 Body: AnimalStatusUpdateRequest { status }
      await axios.put(`/animals/${id}/status`, { status });
      showToast('동물 상태가 성공적으로 변경되었습니다.', 'success');
      navigate(`/animals/${id}`);
    } catch (err: any) {
      showToast('상태 수정 실패: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <Edit3 size={22} color="var(--primary-color)" />
        <span>동물 보호 상태 변경</span>
      </h2>
      {animal && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>
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
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
          상태 변경 완료
        </button>
      </form>
    </section>
  );
};

export default AnimalStatusEditPage;
