import { useState } from "react";
import styles from "../styles/Register.module.css";
import { registerUser } from "../api/user";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // ✅ 유효성 검사 함수
  const validateForm = () => {
    const nameRegex = /^[가-힣a-zA-Z]{2,}$/; // 한글 또는 영문 2자 이상
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!nameRegex.test(form.name)) {
      return "이름은 한글 또는 영문 2자 이상이어야 합니다.";
    }
    if (!emailRegex.test(form.email)) {
      return "유효한 이메일 형식이 아닙니다.";
    }
    if (!passwordRegex.test(form.password)) {
      return "비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.";
    }
    if (form.password !== form.confirmPassword) {
      return "비밀번호가 일치하지 않습니다.";
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
      const res = await registerUser(form);
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="이름 (한글 또는 영문 2자 이상)"
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
        <input
          type="password"
          name="password"
          placeholder="비밀번호 (영문+숫자 8자 이상)"
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
        <button type="submit">가입하기</button>
      </form>
    </div>
  );
};

export default Register;
