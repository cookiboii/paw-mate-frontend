import React, { useState } from "react";
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
  const [step, setStep] = useState(1); // 1: 이메일 전송, 2: 인증 코드 확인, 3: 비밀번호 변경
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/adoptmate/send-reset-code", null, {
        params: { email },
      });
      showToast("📧 인증코드가 이메일로 전송되었습니다.", "success");
      setStep(2);
    } catch (err) {
      showToast("❌ 이메일 전송 실패: 존재하지 않는 계정이거나 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/adoptmate/verify-reset-code", null, {
        params: { email, code },
      });
      showToast("✅ 인증 성공! 새 비밀번호를 입력해주세요.", "success");
      setStep(3);
    } catch (err) {
      showToast("❌ 인증 실패: " + (err.response?.data?.message || err.response?.data || "인증코드가 올바르지 않습니다."), "error");
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
      showToast("🎉 비밀번호가 성공적으로 변경되었습니다! 로그인해 주세요.", "success");
      navigate("/login");
    } catch (err) {
      showToast("❌ 비밀번호 변경 실패: " + (err.response?.data?.message || err.response?.data || "오류가 발생했습니다."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>비밀번호 찾기</h2>
        <p className={styles.subtitle}>
          {step === 1 && "가입하신 이메일로 인증번호를 전송합니다."}
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

      {/* Step 2: 인증 코드 입력 */}
      {step === 2 && (
        <form onSubmit={handleCodeVerify} className={styles.form}>
          <FloatingInput
            label="인증 코드 (6자리)"
            type="text"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "확인 중..." : "인증 코드 확인"}
          </button>
        </form>
      )}

      {/* Step 3: 새 비밀번호 입력 */}
      {step === 3 && (
        <form onSubmit={handlePasswordReset} className={styles.form}>
          <FloatingInput
            label="새 비밀번호 (8자 이상)"
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <FloatingInput
            label="새 비밀번호 확인"
            type="password"
            name="newPasswordConfirm"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            required
          />
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
