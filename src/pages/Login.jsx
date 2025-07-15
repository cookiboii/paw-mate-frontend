import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import { loginUser } from "../api/user";
import { useAuth } from "../context/AuthContext";
import kakaoLoginImg from "../assets/kakao_login_medium_narrow.png";

const Login = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;

  // 일반 로그인 폼 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // 일반 로그인 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      const token = res.data?.token || res.data?.data?.token || res.data?.result?.token;
      const role = res.data?.role || res.data?.data?.role || res.data?.result?.role;
      const email = res.data?.email || res.data?.data?.email || res.data?.result?.email;

      if (!token || !role) {
        setError("로그인 응답에 토큰 또는 역할 정보가 없습니다.");
        return;
      }

      const userInfo = { email, role };

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      login(token, userInfo);
      alert("로그인 성공!");

      if (onLoginSuccess) onLoginSuccess();

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  // 카카오 로그인 팝업 메시지 수신 처리
  useEffect(() => {
    const handleMessage = (event) => {
      // 보안 체크: 반드시 여러분 앱의 프론트 URL로 변경하세요!
      if (event.origin === "http://localhost:5173") return;

      const { type, token, id, role, provider } = event.data;

      if (type === "OAUTH_SUCCESS") {
        const userInfo = {
          email: id,
          role,
          provider,
        };

        // 토큰과 역할 localStorage에 저장
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("provider", provider);

        // 로그인 컨텍스트 업데이트
        login(token, userInfo);

        alert("카카오 로그인 성공!");

        if (onLoginSuccess) onLoginSuccess();

        navigate("/");
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [login, navigate, onLoginSuccess]);

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>로그인</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="이메일"
          value={form.email}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          required
          className={styles.input}
        />
        {error && <p style={{ color: "red", marginTop: "-10px" }}>{error}</p>}
        <button type="submit" className={styles.submitButton}>로그인</button>

        {/* 카카오 로그인 버튼: 새 팝업 창으로 열기 */}
        <div className={styles.kakaoLoginWrapper}>
          <button
            type="button"
            onClick={() => {
              window.open(
                kakaoAuthUrl,
                "kakao-login-popup",
                "width=500,height=600,scrollbars=yes,resizable=yes"
              );
            }}
            className={styles.kakaoButton}
          >
<img 
  src={kakaoLoginImg} 
  alt="카카오 로그인" 
  className={styles.kakaoLoginImg}
/>

          </button>
        </div>
      </form>

      <p className={styles.signupPrompt}>
        아직 계정이 없으신가요?{" "}
        <span className={styles.signupLink} onClick={() => navigate("/register")}>
          회원가입
        </span>
      </p>
    </div>
  );
};

export default Login;
