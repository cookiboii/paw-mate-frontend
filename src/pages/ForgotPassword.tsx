import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { sendResetCode, verifyResetCode, resetPassword } from '../api/auth';
import styles from '../styles/ForgotPassword.module.css';
import FloatingInput from '../components/FloatingInput';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';
import { getErrorMessage } from '../utils/error';

const ForgotPassword: React.FC = () => {
  usePageTitle('비밀번호 찾기');
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // 1: 이메일 전송, 2: 인증 코드 확인, 3: 비밀번호 변경
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3분 타이머
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // 타이머 카운트다운
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      showToast('인증 시간이 만료되었습니다. 인증번호를 다시 요청해 주세요.', 'error');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeLeft, showToast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1단계: 인증코드 발송
  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('이메일을 입력해 주세요.', 'error');
      return;
    }

    setLoading(true);
    try {
      await sendResetCode(email);
      showToast('입력하신 이메일로 6자리 인증 코드가 전송되었습니다.', 'success');
      setStep(2);
      setTimeLeft(180);
      setTimerActive(true);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, '인증 코드 전송에 실패했습니다. 이메일을 확인해 주세요.');
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2단계: 인증코드 검증
  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('인증 코드를 입력해 주세요.', 'error');
      return;
    }

    if (timeLeft === 0) {
      showToast('인증 시간이 만료되었습니다. 코드를 재발송해 주세요.', 'error');
      return;
    }

    setLoading(true);
    try {
      await verifyResetCode(email, code);
      showToast('인증이 완료되었습니다. 새 비밀번호를 설정해 주세요.', 'success');
      setTimerActive(false);
      setStep(3);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, '인증 코드가 올바르지 않거나 만료되었습니다.');
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3단계: 새 비밀번호 설정
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      showToast('비밀번호는 최소 8자 이상이어야 합니다.', 'error');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      showToast('비밀번호 확인이 일치하지 않습니다.', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, newPassword);
      showToast('비밀번호가 성공적으로 재설정되었습니다! 새 비밀번호로 로그인해 주세요.', 'success');
      navigate('/login');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, '비밀번호 변경에 실패했습니다. 다시 시도해 주세요.');
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>비밀번호 찾기</h2>
        <p className={styles.subtitle}>
          {step === 1 && '가입 시 사용한 이메일 주소를 입력하시면 인증 코드를 보내드립니다.'}
          {step === 2 && '이메일로 전송된 6자리 인증 코드를 입력해 주세요.'}
          {step === 3 && '새로운 비밀번호를 입력해 주세요.'}
        </p>
      </div>

      {/* 진행 단계 표시 */}
      <div className={styles.stepIndicator}>
        <div className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>1</div>
        <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : ''}`} />
        <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''} ${step > 2 ? styles.stepCompleted : ''}`}>2</div>
        <div className={`${styles.stepLine} ${step >= 3 ? styles.stepLineActive : ''}`} />
        <div className={`${styles.stepDot} ${step === 3 ? styles.stepActive : ''}`}>3</div>
      </div>

      {/* 1단계: 이메일 입력 */}
      {step === 1 && (
        <form onSubmit={handleSendCode} className={styles.form}>
          <FloatingInput
            label="가입한 이메일 주소"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '코드 발송 중...' : '인증 코드 발송'}
          </button>
        </form>
      )}

      {/* 2단계: 인증코드 입력 */}
      {step === 2 && (
        <form onSubmit={handleVerifyCode} className={styles.form}>
          <div className={styles.inputRelative}>
            <FloatingInput
              label="인증 코드 6자리"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              required
              disabled={loading}
            />
            {timerActive && (
              <span className={`${styles.timerBadge} ${timeLeft < 60 ? styles.timerUrgent : ''}`}>
                {formatTime(timeLeft)}
              </span>
            )}
          </div>

          <div className={styles.codeRow}>
            <div className={styles.codeInput}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleSendCode}
                disabled={loading}
              >
                인증코드 재발송
              </button>
            </div>
            <button
              type="submit"
              className={`${styles.submitBtn} ${styles.codeSubmitBtn}`}
              disabled={loading || timeLeft === 0}
            >
              {loading ? '확인 중...' : '인증 완료'}
            </button>
          </div>
        </form>
      )}

      {/* 3단계: 새 비밀번호 설정 */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className={styles.form}>
          <div className={styles.inputRelative}>
            <FloatingInput
              label="새 비밀번호 (8자 이상)"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="비밀번호 보기"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className={styles.inputRelative}>
            <FloatingInput
              label="새 비밀번호 확인"
              type={showPasswordConfirm ? 'text' : 'password'}
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              aria-label="비밀번호 확인 보기"
            >
              {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '변경 중...' : '비밀번호 재설정 완료'}
          </button>
        </form>
      )}

      <div className={styles.footerActions}>
        {step > 1 ? (
          <button className={styles.backBtn} onClick={() => setStep((prev) => prev - 1)}>
            <ArrowLeft size={16} /> 이전 단계
          </button>
        ) : (
          <span />
        )}
        <Link to="/login" className={styles.loginLink}>
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
