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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app";
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const BACKEND_ORIGIN = API_BASE_URL ? new URL(API_BASE_URL).origin : window.location.origin;
  const kakaoAuthUrl = (() => {
    if (!KAKAO_CLIENT_ID || !KAKAO_REDIRECT_URI) return "";

    const params = new URLSearchParams({
      response_type: "code",
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

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

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event || !event.data || typeof event.data !== "object") return;

      const allowedOrigins = new Set([BACKEND_ORIGIN, window.location.origin]);
      if (!allowedOrigins.has(event.origin)) {
        console.warn("Blocked OAuth message from unexpected origin:", event.origin);
        return;
      }

      const { type, token, id, role, provider } = event.data;
      if (type === "OAUTH_SUCCESS") {
        const userInfo = { email: id, role, provider };
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("provider", provider);
        login(token, userInfo);
        alert("카카오 로그인 성공!");
        if (onLoginSuccess) onLoginSuccess();
        navigate("/");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [BACKEND_ORIGIN, login, navigate, onLoginSuccess]);

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
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.submitButton}>로그인</button>
      </form>

      <div className={styles.extraActions}>
        <span onClick={() => navigate("/forgot-password")} className={styles.link}>
          비밀번호를 잊으셨나요?
        </span>
      </div>

      <div className={styles.divider}>또는</div>

      <div className={styles.kakaoLoginWrapper}>
        <button
          type="button"
          onClick={() => {
            if (!KAKAO_CLIENT_ID || !KAKAO_REDIRECT_URI) {
              alert("카카오 로그인 설정이 비어 있습니다. 관리자에게 문의하세요.");
              return;
            }

            const popup = window.open(
              kakaoAuthUrl,
              "kakao-login-popup",
              "width=500,height=600,scrollbars=yes,resizable=yes"
            );

            if (!popup) {
              alert("팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용한 뒤 다시 시도해주세요.");
            }
          }}
          className={styles.kakaoButton}
        >
          <img src={kakaoLoginImg} alt="카카오 로그인" className={styles.kakaoLoginImg} />
        </button>
      </div>

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
