import { useState } from "react";
import styles from "../styles/Register.module.css";
import { registerUser } from "../api/user";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const validateForm = () => {
    const nameRegex = /^[가-힣a-zA-Z]{2,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!nameRegex.test(form.name)) return "이름은 한글 또는 영문 2자 이상이어야 합니다.";
    if (!emailRegex.test(form.email)) return "유효한 이메일 형식이 아닙니다.";
    if (!passwordRegex.test(form.password)) return "비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.";
    if (form.password !== form.confirmPassword) return "비밀번호가 일치하지 않습니다.";
    if (!emailVerified) return "이메일 인증을 완료해주세요.";
    return null;
  };

  const handleEmailSend = async () => {
    if (!form.email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    try {
      await axios.post("/adoptmate/verify-email", { email: form.email });
      setEmailSent(true);
      setMessage("인증 코드가 이메일로 전송되었습니다.");
    } catch (err) {
      const msg = err.response?.data?.message || "이메일 인증 요청 실패";
      setError(msg);
      setEmailSent(false);
    }
  };

  const handleEmailVerify = async () => {
    try {
      const res = await axios.post("/adoptmate/verify-code", {
        email: form.email,
        code: emailCode,
      });
      if (res.status === 200) {
        setEmailVerified(true);
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
      await registerUser(form); // form: name, email, password
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "회원가입 실패";
      setError(msg);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="이메일"
          value={form.email}
          onChange={handleChange}
          required
        />
        <button type="button" onClick={handleEmailSend} disabled={emailVerified}>
          인증 코드 받기
        </button>

        {emailSent && !emailVerified && (
          <>
            <input
              type="text"
              placeholder="인증 코드 입력"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              required
            />
            <button type="button" onClick={handleEmailVerify}>
              이메일 인증 확인
            </button>
          </>
        )}

        {emailVerified && <p style={{ color: "green" }}>✅ 이메일 인증 완료</p>}

        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="비밀번호 확인"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        <button type="submit">가입하기</button>
      </form>
    </div>
  );
};

export default Register;
