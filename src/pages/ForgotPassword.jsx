import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import styles from "../styles/ForgotPassword.module.css";
import FloatingInput from "../components/FloatingInput";
import { useToast } from "../context/ToastContext";
import usePageTitle from "../hooks/usePageTitle";

const ForgotPassword = () => {
  usePageTitle('비밀번호 찾기');
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [step, setStep] = useState(1); // 1: 이메일 전송, 2: 인증 코드 확인, 3: 비밀번호 변경
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분 타이머
  const [timerActive, setTimerActive] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // 타이머 카운트다운
  useEffect(() => {
    let timer = null;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      showToast("인증 시간이 만료되었습니다. 인증번호를 다시 요청해 주세요.", "warning");
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeLeft, showToast]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEmailSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/adoptmate/send-reset-code", null, {
        params: { email },
      });
      showToast("인증코드가 이메일로 전송되었습니다.", "info");
      setStep(2);
      setTimeLeft(180);
      setTimerActive(true);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || "존재하지 않는 계정이거나 이메일 전송에 실패했습니다.";
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerify = async (e) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      showToast("인증번호가 만료되었습니다. 재전송을 눌러주세요.", "error");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/adoptmate/verify-reset-code", null, {
        params: { email, code },
      });
      showToast("인증이 완료되었습니다. 새 비밀번호를 입력해주세요.", "info");
      setTimerActive(false);
      setStep(3);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || "인증코드가 올바르지 않거나 만료되었습니다.";
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== newPasswordConfirm) {
      showToast("비밀번호 확인이 일치하지 않습니다.", "error");
      return;
    }

    if (newPassword.length < 8) {
      showToast("비밀번호는 8자 이상이어야 합니다.", "error");
      return;
    }

    setLoading(true);

    try {
      await axios.patch("/adoptmate/password", {
        email,
        password: newPassword,
      });
      showToast("비밀번호가 성공적으로 변경되었습니다! 로그인해 주세요.", "info");
      navigate("/login");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || "비밀번호 변경에 실패했습니다. 다시 시도해 주세요.";
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>비밀번호 찾기</h2>
        <p className={styles.subtitle}>
          {step === 1 && "가입하신 이메일 주소로 인증번호를 전송해 드립니다."}
          {step === 2 && "이메일로 발송된 6자리 인증 코드를 입력하세요."}
          {step === 3 && "새로운 비밀번호를 설정하세요."}
        </p>
      </div>

      {/* 단계 인디케이터 */}
      <div className={styles.stepIndicator}>
        <div className={`${styles.stepDot} ${step === 1 ? styles.stepActive : styles.stepCompleted}`}>1</div>
        <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : ''}`} />
        <div className={`${styles.stepDot} ${step === 2 ? styles.stepActive : step > 2 ? styles.stepCompleted : ''}`}>2</div>
        <div className={`${styles.stepLine} ${step >= 3 ? styles.stepLineActive : ''}`} />
        <div className={`${styles.stepDot} ${step === 3 ? styles.stepActive : ''}`}>3</div>
      </div>

      {/* Step 1: 이메일 입력 */}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className={styles.form}>
          <FloatingInput
            label="가입한 이메일"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "전송 중..." : "인증번호 받기"}
          </button>
        </form>
      )}

      {/* Step 2: 인증 코드 입력 & 타이머 */}
      {step === 2 && (
        <form onSubmit={handleCodeVerify} className={styles.form}>
          <div style={{ position: 'relative' }}>
            <FloatingInput
              label="인증 코드 (6자리)"
              type="text"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <div style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: timeLeft < 30 ? 'var(--danger-color)' : 'var(--primary-color)',
            }}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleEmailSubmit}
              disabled={loading}
              style={{
                flex: '1',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              재전송
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading || timeLeft === 0} style={{ flex: '2' }}>
              {loading ? "확인 중..." : "인증 확인"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: 새 비밀번호 입력 */}
      {step === 3 && (
        <form onSubmit={handlePasswordReset} className={styles.form}>
          <div style={{ position: 'relative' }}>
            <FloatingInput
              label="새 비밀번호 (8자 이상)"
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="비밀번호 표시 전환"
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <FloatingInput
              label="새 비밀번호 확인"
              type={showPasswordConfirm ? "text" : "password"}
              name="newPasswordConfirm"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              aria-label="비밀번호 확인 표시 전환"
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showPasswordConfirm ? (
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "변경 중..." : "비밀번호 재설정 완료"}
          </button>
        </form>
      )}

      <div className={styles.footerActions}>
        {step > 1 ? (
          <button className={styles.backBtn} onClick={() => setStep(prev => prev - 1)}>
            ← 이전 단계로
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
