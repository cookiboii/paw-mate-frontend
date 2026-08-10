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
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 중복 클릭 방지용 상태

  if (!isAuthenticated) {
    return <p>로그인이 필요합니다.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // 이미 제출 중이면 중단
    setIsSubmitting(true);

    try {
      const res = await axios.post(`/adoptions/animals/${animalId}`, {
        interview,
      });

      // 신청 성공 후, 동물 상태를 '대기중(WAITING)'으로 변경 (백엔드에서 자동 처리하지 않는 경우를 위함)
      try {
        await axios.put(`/animals/${animalId}/status`, { status: 'WAITING' }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (statusErr) {
        console.error('동물 상태 변경 실패:', statusErr);
      }

      alert('입양 신청이 완료되었습니다!');
      navigate(`/animals/${animalId}`);
    } catch (err) {
      console.error(err);
      setError('신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false); // 완료 후 다시 활성화
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
            disabled={isSubmitting} // 제출 중 입력 비활성화
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? '신청 중...' : '신청하기'}
        </button>
      </form>
    </div>
  );
};

export default AdoptionForm;
