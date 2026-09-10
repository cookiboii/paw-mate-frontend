import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { submitAdoption, getMyAdoptions } from '../api/adoption';
import { fetchAnimalById } from '../api/animal';
import styles from '../styles/pages/AdoptionForm.module.css';
import usePageTitle from '../hooks/usePageTitle';
import { Animal } from '../types/animal';
import { formatPhoneNumber, isValidPhoneNumber } from '../utils/validation';
import { FileText, Lock, CheckCircle2, ClipboardList, ArrowLeft } from 'lucide-react';
import { getErrorMessage } from '../utils/error';


const AdoptionForm: React.FC = () => {
  usePageTitle('입양 신청서 작성');
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [housingType, setHousingType] = useState<string>('APARTMENT');
  const [hasPet, setHasPet] = useState<string>('없음');
  const [interview, setInterview] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!animalId) return;

    // 동물 정보 조회
    const fetchAnimal = async () => {
      try {
        const data = await fetchAnimalById(animalId);
        setAnimal(data);
      } catch (err) {
        console.warn('동물 정보 로드 실패:', err);
      }
    };
    fetchAnimal();

    // 로그인 상태일 때 해당 동물 입양 신청 중복 여부 확인
    if (isAuthenticated) {
      getMyAdoptions()
        .then((adoptions) => {
          const found = adoptions.some((item) => String(item.animalId) === String(animalId));
          setHasAlreadyApplied(found);
        })
        .catch((err) => {
          console.warn('내 입양 신청 내역 확인 실패:', err);
        });
    }
  }, [animalId, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPrompt}>
        <div className={styles.promptCard}>
          <span>
            <Lock size={44} className={styles.promptIconLock} />
          </span>
          <h3>로그인이 필요한 서비스입니다</h3>
          <p>입양 신청서를 작성하시려면 먼저 로그인해 주세요.</p>
          <Link
            to="/login"
            state={{ from: `/adopt/${animalId}` }}
            className={`btn-primary ${styles.promptLink}`}
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  // 이미 해당 동물에 대해 입양 신청서를 제출한 경우
  if (hasAlreadyApplied) {
    return (
      <div className={styles.loginPrompt}>
        <div className={styles.promptCard}>
          <span>
            <CheckCircle2 size={52} className={styles.promptIconSuccess} />
          </span>
          <h3>이미 입양 신청이 접수된 아이입니다</h3>
          <p className={styles.promptDesc}>
            회원님께서 제출하신 입양 신청서가 정상 접수되어 현재 보호소 담당자가 정성껏 심사 중입니다.<br />
            동일 동물에 대한 중복 신청은 제한됩니다.
          </p>
          <div className={styles.promptButtonGroup}>
            <Link
              to="/mypage"
              className={`btn-primary ${styles.promptButton}`}
            >
              <ClipboardList size={18} />
              <span>내 입양 신청 내역 확인하기</span>
            </Link>
            <Link
              to="/animals"
              className={`btn-secondary ${styles.promptButton}`}
            >
              <ArrowLeft size={18} />
              <span>다른 아이들 보러가기</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!isValidPhoneNumber(phone.trim())) errors.phone = '010-1234-5678 형식으로 입력해 주세요.';
    if (interview.trim().length < 10) errors.interview = '입양 동기와 돌봄 계획을 10자 이상 작성해 주세요.';
    if (!agreed) errors.agreed = '입양 필수 동의 항목을 확인해 주세요.';
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast('입력 내용을 확인해 주세요.', 'error');
      return;
    }

    if (!animalId) {
      showToast('동물 정보를 찾을 수 없습니다.', 'error');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);

    // 백엔드 AdoptionCreateRequest DTO: phone, housingType, hasPet, reason
    const payload = {
      phone: phone.trim(),
      housingType: housingType,
      hasPet: hasPet,
      reason: interview.trim(),
    };

    try {
      await submitAdoption(animalId, payload);

      showToast('입양 신청이 성공적으로 접수되었습니다! 담당자가 검토 후 연락드립니다.', 'success');
      navigate(`/animals/${animalId}`);
    } catch (err: unknown) {
      console.error('입양 신청 에러:', err);
      const errorMsg = getErrorMessage(err, '신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>
            <FileText size={24} className={styles.headerIcon} />
            <span>입양 신청서 작성</span>
          </h2>
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
              <p>
                {animal.species} • {animal.gender === 'M' || animal.gender === 'MALE' ? '수컷' : '암컷'} •{' '}
                {animal.age || 0}살 추정
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="applicant-name">신청자 이름</label>
              <input
                id="applicant-name"
                type="text"
                value={user?.name || ''}
                disabled
                className={styles.disabledInput}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="adoption-phone">연락 가능한 전화번호 *</label>
              <input
                id="adoption-phone"
                type="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                required
                className={styles.input}
                aria-invalid={Boolean(validationErrors.phone)}
                aria-describedby={validationErrors.phone ? 'adoption-phone-error' : undefined}
              />
              {validationErrors.phone && <p id="adoption-phone-error" className={styles.fieldError}>{validationErrors.phone}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="housing-type">거주 형태</label>
              <select
                id="housing-type"
                value={housingType}
                onChange={(e) => setHousingType(e.target.value)}
                className={styles.select}
              >
                <option value="APARTMENT">아파트</option>
                <option value="DETACHED_HOUSE">단독주택</option>
                <option value="VILLA">빌라/다세대</option>
                <option value="ONE_ROOM">원룸/오피스텔</option>
                <option value="ETC">기타</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="has-pet">현재 반려동물 유무</label>
              <select
                id="has-pet"
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
            <div className={styles.fieldHeader}>
              <label htmlFor="adoption-interview" className={`${styles.label} ${styles.fieldHeaderLabel}`}>입양 동기 및 돌봄 계획 *</label>
              <span className={interview.trim().length < 10 ? styles.charCountError : styles.charCount}>
                {interview.length}자 {interview.trim().length < 10 && '(최소 10자 이상)'}
              </span>
            </div>
            <textarea
              id="adoption-interview"
              value={interview}
              onChange={(e) => setInterview(e.target.value)}
              required
              rows={6}
              placeholder="1. 왜 이 아이를 입양하고 싶으신가요?&#13;&#10;2. 하루에 함께 보낼 수 있는 시간은 어느 정도인가요?&#13;&#10;3. 가족 구성원 모두 입양에 동의하셨나요?"
              className={styles.textarea}
              disabled={isSubmitting}
              aria-invalid={Boolean(validationErrors.interview)}
              aria-describedby={validationErrors.interview ? 'adoption-interview-error' : undefined}
            />
            {validationErrors.interview && <p id="adoption-interview-error" className={styles.fieldError}>{validationErrors.interview}</p>}
          </div>

          <div className={styles.agreementBox}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className={styles.checkbox}
                aria-invalid={Boolean(validationErrors.agreed)}
                aria-describedby={validationErrors.agreed ? 'adoption-agreement-error' : undefined}
              />
              <span>
                (필수) 본인은 입양 후 반려동물이 자연사할 때까지 평생 책임지고 사랑으로 양육할 것을 서약합니다.
              </span>
            </label>
            {validationErrors.agreed && <p id="adoption-agreement-error" className={styles.fieldError}>{validationErrors.agreed}</p>}
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
