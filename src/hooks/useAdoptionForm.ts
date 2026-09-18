import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyAdoptions, submitAdoption } from '../api/adoption';
import { fetchAnimalById } from '../api/animal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Animal } from '../types/animal';
import { getErrorMessage } from '../utils/error';
import { isValidPhoneNumber } from '../utils/validation';

export default function useAdoptionForm() {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [phone, setPhone] = useState('');
  const [housingType, setHousingType] = useState('APARTMENT');
  const [hasPet, setHasPet] = useState('없음');
  const [interview, setInterview] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!animalId) return;
    let active = true;
    fetchAnimalById(animalId)
      .then((data) => {
        if (active) setAnimal(data);
      })
      .catch((error) => console.warn('동물 정보 로드 실패:', error));
    if (isAuthenticated) {
      getMyAdoptions()
        .then((adoptions) => {
          if (active)
            setHasAlreadyApplied(adoptions.some((item) => String(item.animalId) === animalId));
        })
        .catch((error) => console.warn('내 입양 신청 내역 확인 실패:', error));
    }
    return () => {
      active = false;
    };
  }, [animalId, isAuthenticated]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!isValidPhoneNumber(phone.trim())) errors.phone = '010-1234-5678 형식으로 입력해 주세요.';
    if (interview.trim().length < 10)
      errors.interview = '입양 동기와 돌봄 계획을 10자 이상 작성해 주세요.';
    if (!agreed) errors.agreed = '입양 필수 동의 항목을 확인해 주세요.';
    if (interview.trim().length > 3000)
      errors.interview = '입양 동기와 향후 계획은 3,000자 이하로 작성해 주세요.';
    if (hasPet.length > 50)
      errors.hasPet = '반려동물 정보는 50자 이하로 입력해 주세요.';
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
    try {
      await submitAdoption(animalId, {
        phone: phone.trim(),
        housingType,
        hasPet,
        reason: interview.trim(),
      });
      showToast('입양 신청이 성공적으로 접수되었습니다! 담당자가 검토 후 연락드립니다.', 'success');
      navigate(`/animals/${animalId}`);
    } catch (error: unknown) {
      showToast(
        getErrorMessage(error, '신청 중 오류가 발생했습니다. 다시 시도해 주세요.'),
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    animalId,
    isAuthenticated,
    user,
    animal,
    phone,
    setPhone,
    housingType,
    setHousingType,
    hasPet,
    setHasPet,
    interview,
    setInterview,
    agreed,
    setAgreed,
    isSubmitting,
    hasAlreadyApplied,
    validationErrors,
    handleSubmit,
    cancel: () => navigate(-1),
  };
}
