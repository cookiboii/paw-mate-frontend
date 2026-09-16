import React from "react";
import styles from "../styles/pages/Register.module.css";
import FloatingInput from "../components/FloatingInput";
import usePageTitle from "../hooks/usePageTitle";
import useRegistrationForm from "../hooks/useRegistrationForm";
import { User, Mail, Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";

const Register: React.FC = () => {
  usePageTitle('회원가입');
  const {
    form, emailSent, emailCode, setEmailCode, emailVerified, error, message,
    isSubmitting, showPassword, setShowPassword, showConfirmPassword,
    setShowConfirmPassword, timer, isTimerActive, isLengthOk, isPasswordValid,
    isConfirmPasswordValid, namePattern: nameRegex, emailPattern: emailRegex,
    handleChange, handleEmailSend, handleEmailVerify, handleSubmit, goToLogin,
  } = useRegistrationForm();

  const formatTimer = (seconds: number) => {
    const validSeconds = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(validSeconds / 60);
    const remainingSeconds = validSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>가족이 되어주세요</h2>
        <p className={styles.subtitle}>Paw Mate의 회원이 되어 반려동물에게 따뜻한 가족을 선물하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 이름 입력 */}
        <div className={styles.fieldGroup}>
          <FloatingInput
            label="이름"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            icon={<User size={18} />}
          />
          {form.name && !nameRegex.test(form.name) && (
            <p className={`${styles.helperText} ${styles.error}`}>
              <AlertCircle size={14} /> 이름은 한글 또는 영문 2자 이상이어야 합니다.
            </p>
          )}
        </div>

        {/* 이메일 입력 */}
        <div className={styles.fieldGroup}>
          <div className={styles.verifyRow}>
            <FloatingInput
              label="이메일 주소"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={emailVerified}
              required
              icon={<Mail size={18} />}
            />
            <button
              type="button"
              onClick={handleEmailSend}
              disabled={emailVerified || !form.email || !emailRegex.test(form.email) || isTimerActive}
              className={`${styles.verifyRowButton} ${
                form.email && emailRegex.test(form.email) && !emailVerified && !isTimerActive ? styles.verifyActiveButton : ""
              }`}
            >
              {emailSent ? "재전송" : "인증 요청"}
            </button>
          </div>
          {form.email && !emailRegex.test(form.email) && (
            <p className={`${styles.helperText} ${styles.error}`}>
              <AlertCircle size={14} /> 올바른 이메일 형식을 입력해주세요.
            </p>
          )}
          {emailVerified && (
            <p className={`${styles.helperText} ${styles.success}`}>
              <Check size={14} /> 이메일 인증이 완료되었습니다.
            </p>
          )}
        </div>

        {/* 이메일 인증 번호 입력 */}
        {emailSent && !emailVerified && (
          <div className={styles.fieldGroup}>
            <div className={styles.verifyRow}>
              <FloatingInput
                label="인증 코드"
                type="text"
                name="emailCode"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                required
                icon={<Lock size={18} />}
                className={isTimerActive ? styles.inputWithTimer : undefined}
              >
                {isTimerActive && (
                  <span className={styles.timerBadge}>{formatTimer(timer)}</span>
                )}
              </FloatingInput>
              <button
                type="button"
                onClick={handleEmailVerify}
                disabled={!emailCode}
                className={`${styles.verifyRowButton} ${emailCode ? styles.verifyActiveButton : ""}`}
              >
                인증 확인
              </button>
            </div>
          </div>
        )}

        {/* 비밀번호 입력 */}
        <div className={styles.fieldGroup}>
          <FloatingInput
            label="비밀번호"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            icon={<Lock size={18} />}
            className={styles.inputWithEye}
          >
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </FloatingInput>
          {form.password && (
            <div className={styles.requirements}>
              <div className={`${styles.requirementItem} ${isLengthOk ? styles.valid : ""}`}>
                <span className={styles.requirementIcon}><Check size={12} /></span>
                6자 이상
              </div>
            </div>
          )}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className={styles.fieldGroup}>
          <FloatingInput
            label="비밀번호 확인"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            icon={<Lock size={18} />}
            className={styles.inputWithEye}
          >
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.passwordToggle}
              aria-label={showConfirmPassword ? '비밀번호 확인 숨기기' : '비밀번호 확인 보기'}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </FloatingInput>
          {form.confirmPassword && (
            <div className={`${styles.helperText} ${isConfirmPasswordValid ? styles.success : styles.error}`}>
              {isConfirmPasswordValid ? (
                <>
                  <Check size={14} /> 비밀번호가 일치합니다.
                </>
              ) : (
                <>
                  <AlertCircle size={14} /> 비밀번호가 일치하지 않습니다.
                </>
              )}
            </div>
          )}
        </div>

        {/* API 에러 및 메시지 */}
        {error && (
          <p className={`${styles.helperText} ${styles.error}`}>
            <AlertCircle size={14} /> {error}
          </p>
        )}
        {message && !error && (
          <p className={`${styles.helperText} ${styles.success}`}>
            <Check size={14} /> {message}
          </p>
        )}

        {/* 회원가입 버튼 */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={
            isSubmitting ||
            !form.name ||
            !nameRegex.test(form.name) ||
            !form.email ||
            !emailRegex.test(form.email) ||
            !emailVerified ||
            !isPasswordValid ||
            form.password !== form.confirmPassword
          }
        >
          {isSubmitting ? (
            <>
              <div className={styles.spinner} />
              가입 중...
            </>
          ) : (
            "가입하기"
          )}
        </button>
      </form>

      <p className={styles.loginPrompt}>
        이미 계정이 있으신가요?
        <button type="button" className={styles.loginLink} onClick={goToLogin}>
          로그인
        </button>
      </p>
    </div>
  );
};

export default Register;
