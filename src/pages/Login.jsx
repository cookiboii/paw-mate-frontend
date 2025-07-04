import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import { loginUser } from "../api/user";
import { useAuth } from "../context/AuthContext";

const Login = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext에서 로그인 메서드 사용

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await loginUser(form);
      console.log("서버 응답 전체 res:", res);
      console.log("res.data:", res.data);
  
      const token = res.data?.token || res.data?.data?.token || res.data?.result?.token;
  
      if (!token) {
        setError("로그인 응답에 토큰이 없습니다.");
        return;
      }
  
      console.log("받은 토큰:", token);
  
      login(token);
      alert("로그인 성공!");
      if (onLoginSuccess) onLoginSuccess();
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "로그인에 실패했습니다.");
    }
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
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">로그인</button>
      </form>

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
