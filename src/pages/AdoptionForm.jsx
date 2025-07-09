import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import styles from '../styles/AdoptionForm.module.css';

const AdoptionForm = () => {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [interview, setInterview] = useState('');
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return <p>로그인이 필요합니다.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/adoptions/animals/${animalId}/`, {
        interview,
      });

      alert('입양 신청이 완료되었습니다!');
      navigate(`/animals/${animalId}`);
    } catch (err) {
      console.error(err);
      setError('신청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>입양 신청서</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          입양 동기 및 각오
          <textarea
            value={interview}
            onChange={(e) => setInterview(e.target.value)}
            required
            placeholder="입양을 원하는 이유를 작성해주세요"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitButton}>
          신청하기
        </button>
      </form>
    </div>
  );
};

export default AdoptionForm;
