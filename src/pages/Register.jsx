import { useState, useEffect } from "react";
import styles from "../styles/Register.module.css";
import { registerUser } from "../api/user";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

// Inline SVG Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [emailSent, setEmailSent] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state for password toggles and timers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(180);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const navigate = useNavigate();

  // Timer countdown hook
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      setError("인증 시간이 만료되었습니다. 다시 요청해주세요.");
      setEmailSent(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  // Regular expressions
  const nameRegex = /^[가-힣a-zA-Z]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Real-time validations
  const isNameValid = form.name === "" || nameRegex.test(form.name);
  const isEmailValid = form.email === "" || emailRegex.test(form.email);
  
  const hasLetter = /[A-Za-z]/.test(form.password);
  const hasNumber = /\d/.test(form.password);
  const isLengthOk = form.password.length >= 8;
  const isPasswordValid = hasLetter && hasNumber && isLengthOk;
  
  const isConfirmPasswordValid = 
    form.confirmPassword === "" || 
    (form.password === form.confirmPassword && isPasswordValid);

  const validateForm = () => {
    if (!nameRegex.test(form.name)) return "이름은 한글 또는 영문 2자 이상이어야 합니다.";
    if (!emailRegex.test(form.email)) return "유효한 이메일 형식이 아닙니다.";
    if (!isPasswordValid) return "비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.";
    if (form.password !== form.confirmPassword) return "비밀번호가 일치하지 않습니다.";
    if (!emailVerified) return "이메일 인증을 완료해주세요.";
    return null;
  };

  const handleEmailSend = async () => {
    if (!form.email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!emailRegex.test(form.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    try {
      setError("");
      setMessage("인증 메일을 전송 중입니다...");
      await axios.post("/adoptmate/verify-email", { email: form.email });
      setEmailSent(true);
      setTimer(180);
      setIsTimerActive(true);
      setMessage("인증 코드가 이메일로 전송되었습니다.");
    } catch (err) {
      const msg = err.response?.data?.message || "이메일 인증 요청 실패";
      setError(msg);
      setMessage("");
      setEmailSent(false);
      setIsTimerActive(false);
    }
  };

  const handleEmailVerify = async () => {
    if (!emailCode) {
      setError("인증 코드를 입력해주세요.");
      return;
    }
    try {
      setError("");
      const res = await axios.post("/adoptmate/verify-code", {
        email: form.email,
        code: emailCode,
      });
      if (res.status === 200) {
        setEmailVerified(true);
        setIsTimerActive(false);
        setMessage("이메일 인증 완료!");
        setError("");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "인증 코드가 올바르지 않습니다.";
      setError(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await registerUser(form); // form: name, email, password
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "회원가입 실패";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
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
          <label className={styles.label}>이름</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}><UserIcon /></span>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력해주세요"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          {form.name && !nameRegex.test(form.name) && (
            <p className={`${styles.helperText} ${styles.error}`}>
              <AlertIcon /> 이름은 한글 또는 영문 2자 이상이어야 합니다.
            </p>
          )}
        </div>

        {/* 이메일 입력 */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>이메일 주소</label>
          <div className={styles.verifyRow}>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><MailIcon /></span>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={handleChange}
                className={styles.input}
                disabled={emailVerified}
                required
              />
            </div>
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
              <AlertIcon /> 올바른 이메일 형식을 입력해주세요.
            </p>
          )}
          {emailVerified && (
            <p className={`${styles.helperText} ${styles.success}`}>
              <CheckIcon /> 이메일 인증이 완료되었습니다.
            </p>
          )}
        </div>

        {/* 이메일 인증 번호 입력 */}
        {emailSent && !emailVerified && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>인증 코드</label>
            <div className={styles.verifyRow}>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  type="text"
                  placeholder="인증 코드 입력"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className={styles.input}
                  required
                />
                {isTimerActive && (
                  <span className={styles.timerBadge}>{formatTimer(timer)}</span>
                )}
              </div>
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
          <label className={styles.label}>비밀번호</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}><LockIcon /></span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="비밀번호 입력"
              value={form.password}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
              tabIndex="-1"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {form.password && (
            <div className={styles.requirements}>
              <div className={`${styles.requirementItem} ${hasLetter ? styles.valid : ""}`}>
                <span className={styles.requirementIcon}><CheckIcon /></span>
                영문 포함
              </div>
              <div className={`${styles.requirementItem} ${hasNumber ? styles.valid : ""}`}>
                <span className={styles.requirementIcon}><CheckIcon /></span>
                숫자 포함
              </div>
              <div className={`${styles.requirementItem} ${isLengthOk ? styles.valid : ""}`}>
                <span className={styles.requirementIcon}><CheckIcon /></span>
                8자 이상
              </div>
            </div>
          )}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>비밀번호 확인</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}><LockIcon /></span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="비밀번호 재입력"
              value={form.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.passwordToggle}
              tabIndex="-1"
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {form.confirmPassword && (
            <div className={`${styles.helperText} ${isConfirmPasswordValid ? styles.success : styles.error}`}>
              {isConfirmPasswordValid ? (
                <>
                  <CheckIcon /> 비밀번호가 일치합니다.
                </>
              ) : (
                <>
                  <AlertIcon /> 비밀번호가 일치하지 않습니다.
                </>
              )}
            </div>
          )}
        </div>

        {/* API 에러 및 메시지 */}
        {error && (
          <p className={`${styles.helperText} ${styles.error}`}>
            <AlertIcon /> {error}
          </p>
        )}
        {message && !error && (
          <p className={`${styles.helperText} ${styles.success}`}>
            <CheckIcon /> {message}
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
        <span className={styles.loginLink} onClick={() => navigate("/login")}>
          로그인
        </span>
      </p>
    </div>
  );
};

export default Register;
