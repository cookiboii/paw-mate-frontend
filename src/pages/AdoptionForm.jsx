import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../api/axiosInstance';
import styles from '../styles/AdoptionForm.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

const AdoptionForm = () => {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [animal, setAnimal] = useState(null);
  const [phone, setPhone] = useState('');
  const [housingType, setHousingType] = useState('아파트');
  const [hasPet, setHasPet] = useState('없음');
  const [interview, setInterview] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 동물 정보 조회
    const fetchAnimal = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/animals/${animalId}`);
        if (response.ok) {
          const data = await response.json();
          setAnimal(data.result);
        }
      } catch (err) {
        console.warn('동물 정보 로드 실패:', err);
      }
    };
    fetchAnimal();
  }, [animalId]);

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPrompt}>
        <div className={styles.promptCard}>
          <span>🔒</span>
          <h3>로그인이 필요한 서비스입니다</h3>
          <p>입양 신청서를 작성하시려면 먼저 로그인해 주세요.</p>
          <Link to="/login" className="btn-primary" style={{marginTop: '16px', display: 'inline-block'}}>
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      showToast('입양 필수 동의 사항에 체크해 주세요.', 'error');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);

    // 상세 내용 조합
    const formattedInterview = `[연락처]: ${phone || '미기재'}
[주거형태]: ${housingType}
[반려동물 유무]: ${hasPet}
[입양 동기 및 각오]:
${interview}`;

    try {
      await axios.post(`/adoptions/animals/${animalId}`, {
        interview: formattedInterview,
      });

      // 동물 상태를 '대기중(WAITING)'으로 자동 업데이트 시도
      try {
        await axios.put(`/animals/${animalId}/status`, { status: 'WAITING' }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (statusErr) {
        console.warn('동물 상태 변경 실패 (서버 권한 필요):', statusErr);
      }

      showToast('🎉 입양 신청이 성공적으로 접수되었습니다! 담당자가 검토 후 연락드립니다.', 'success');
      navigate(`/animals/${animalId}`);
    } catch (err) {
      console.error(err);
      showToast('신청 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>🐾 입양 신청서 작성</h2>
          <p>한 생명을 평생 가족으로 맞이하기 위한 소중한 첫걸음입니다.</p>
        </div>

        {/* 대상 동물 요약 카드 */}
        {animal && (
          <div className={styles.animalSummary}>
            <img 
              src={animal.image || '/default-animal.jpg'} 
              alt={animal.breed} 
              className={styles.summaryThumb} 
            />
            <div className={styles.summaryInfo}>
              <span className={styles.summaryBadge}>입양 대상</span>
              <h3>{animal.breed || animal.species}</h3>
              <p>{animal.species} • {animal.gender === 'M' || animal.gender === 'MALE' ? '수컷' : '암컷'} • {animal.age || 0}살 추정</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>신청자 이름</label>
              <input 
                type="text" 
                value={user?.name || ''} 
                disabled 
                className={styles.disabledInput} 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>연락 가능한 전화번호 *</label>
              <input 
                type="tel" 
                placeholder="010-0000-0000" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                className={styles.input} 
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>거주 형태</label>
              <select 
                value={housingType} 
                onChange={(e) => setHousingType(e.target.value)} 
                className={styles.select}
              >
                <option value="아파트">아파트</option>
                <option value="단독주택">단독주택</option>
                <option value="빌라/다세대">빌라/다세대</option>
                <option value="원룸/오피스텔">원룸/오피스텔</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>현재 반려동물 유무</label>
              <select 
                value={hasPet} 
                onChange={(e) => setHasPet(e.target.value)} 
                className={styles.select}
              >
                <option value="없음">없음</option>
                <option value="개 1마리 이상">개 1마리 이상</option>
                <option value="고양이 1마리 이상">고양이 1마리 이상</option>
                <option value="기타 동물">기타 동물</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldGroupFull}>
            <label className={styles.label}>입양 동기 및 돌봄 계획 *</label>
            <textarea
              value={interview}
              onChange={(e) => setInterview(e.target.value)}
              required
              rows={6}
              placeholder="1. 왜 이 아이를 입양하고 싶으신가요?&#13;&#10;2. 하루에 함께 보낼 수 있는 시간은 어느 정도인가요?&#13;&#10;3. 가족 구성원 모두 입양에 동의하셨나요?"
              className={styles.textarea}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.agreementBox}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
                className={styles.checkbox}
              />
              <span>
                (필수) 본인은 입양 후 반려동물이 자연사할 때까지 평생 책임지고 사랑으로 양육할 것을 서약합니다.
              </span>
            </label>
          </div>

          <div className={styles.btnRow}>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className={styles.cancelBtn}
            >
              취소
            </button>
            <button 
              type="submit" 
              className={`btn-primary ${styles.submitBtn}`} 
              disabled={isSubmitting}
            >
              {isSubmitting ? '신청서 접수 중...' : '입양 신청서 제출하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdoptionForm;
