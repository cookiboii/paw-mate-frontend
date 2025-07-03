import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 로그인 로직 추가 (ex: axios.post...)
    console.log("로그인 정보:", form);
  };

  return (
    <div className={styles.loginContainer}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
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
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">로그인</button>
      </form>

      {/* ✅ 회원가입 링크 */}
      <p className={styles.signupPrompt}>
        아직 계정이 없으신가요?{" "}
        <span
          className={styles.signupLink}
          onClick={() => navigate("/register")}
        >
          회원가입
        </span>
      </p>
    </div>
  );
};

export default Login;
