import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, verifyCode, verifyEmail } from "../api/auth";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/error";

const NAME_PATTERN = /^[가-힣a-zA-Z]{2,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_VERIFICATION_SECONDS = 180;

export default function useRegistrationForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(EMAIL_VERIFICATION_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((previous) => previous - 1), 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      setError("인증 시간이 만료되었습니다. 다시 요청해주세요.");
      setEmailSent(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer]);

  const isLengthOk = form.password.length >= 6;
  const isPasswordValid = isLengthOk;
  const isConfirmPasswordValid =
    form.confirmPassword === "" ||
    (form.password === form.confirmPassword && isPasswordValid);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleEmailSend = async () => {
    if (!form.email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!EMAIL_PATTERN.test(form.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      setError("");
      setMessage("인증 메일을 전송 중입니다...");
      await verifyEmail(form.email);
      setEmailSent(true);
      setTimer(EMAIL_VERIFICATION_SECONDS);
      setIsTimerActive(true);
      setMessage("인증 코드가 이메일로 전송되었습니다.");
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, "이메일 인증 요청 실패"));
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
      await verifyCode(form.email, emailCode);
      setEmailVerified(true);
      setIsTimerActive(false);
      setMessage("이메일 인증 완료!");
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, "인증 코드가 올바르지 않습니다."));
    }
  };

  const validateForm = () => {
    if (!NAME_PATTERN.test(form.name)) return "이름은 한글 또는 영문 2자 이상이어야 합니다.";
    if (!EMAIL_PATTERN.test(form.email)) return "유효한 이메일 형식이 아닙니다.";
    if (!isPasswordValid) return "비밀번호는 6자 이상이어야 합니다.";
    if (form.password !== form.confirmPassword) return "비밀번호가 일치하지 않습니다.";
    if (!emailVerified) return "이메일 인증을 완료해주세요.";
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await registerUser(form);
      showToast("회원가입이 완료되었습니다! 로그인해 주세요.", "success");
      navigate("/login");
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, "회원가입 실패"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    emailSent,
    emailCode,
    setEmailCode,
    emailVerified,
    error,
    message,
    isSubmitting,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    timer,
    isTimerActive,
    isLengthOk,
    isPasswordValid,
    isConfirmPasswordValid,
    namePattern: NAME_PATTERN,
    emailPattern: EMAIL_PATTERN,
    handleChange,
    handleEmailSend,
    handleEmailVerify,
    handleSubmit,
    goToLogin: () => navigate("/login"),
  };
}
