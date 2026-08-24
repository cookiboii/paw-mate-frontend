import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import styles from "../styles/Login.module.css";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FloatingInput from "../components/FloatingInput";
import kakaoLoginImg from "../assets/kakao_login_medium_narrow.png";
import axios from "../api/axiosInstance";
import usePageTitle from "../hooks/usePageTitle";

const Login = ({ onLoginSuccess }) => {
  usePageTitle('로그인');
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();

  const redirectPath = location.state?.from || "/";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app";
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID || "16a5cc3c2d930524373be21f6bf96353";
  const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI || `${API_BASE_URL}/adoptmate/kakao`;
  const BACKEND_ORIGIN = API_BASE_URL ? new URL(API_BASE_URL).origin : window.location.origin;

  const kakaoAuthUrl = (() => {
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
      const resData = res.data?.result || res.data?.data || res.data || {};
      const token = resData.token;
      const refreshToken = resData.refreshToken;
      const role = resData.role || "USER";
      const email = resData.email || form.email;
      const name = resData.name;

      if (!token) {
        setError("로그인 응답에 토큰이 없습니다.");
        return;
      }

      const userInfo = { email, role, name, provider: "LOCAL" };
      login(token, userInfo, refreshToken);
      if (onLoginSuccess) onLoginSuccess();
      navigate(redirectPath);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.statusMessage || err.response?.data?.message || "로그인에 실패했습니다.";
      setError(errMsg);
      showToast(errMsg, "error");
    }
  };

  // URL search params check (e.g. redirected to /login?token=... or ?code=...)
  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlRole = searchParams.get("role") || "USER";
    const urlEmail = searchParams.get("email") || searchParams.get("id");
    const urlName = searchParams.get("name");
    const urlCode = searchParams.get("code");

    if (urlToken) {
      const userInfo = { email: urlEmail, role: urlRole, name: urlName, provider: "KAKAO" };
      login(urlToken, userInfo);
      if (onLoginSuccess) onLoginSuccess();
      navigate(redirectPath, { replace: true });
      return;
    }

    if (urlCode) {
      axios.get(`/adoptmate/kakao?code=${encodeURIComponent(urlCode)}`)
        .then((res) => {
          let resData = res.data;
          if (typeof resData === "string") {
            try { resData = JSON.parse(resData); } catch { return; }
          }
          const token = resData?.token || resData?.result?.token || resData?.data?.token;
          const role = resData?.role || resData?.result?.role || resData?.data?.role || "USER";
          const email = resData?.email || resData?.result?.email || resData?.data?.email || resData?.id;
          const name = resData?.name || resData?.result?.name;
          if (token) {
            login(token, { email, role, name, provider: "KAKAO" });
            if (onLoginSuccess) onLoginSuccess();
            navigate(redirectPath, { replace: true });
          }
        })
        .catch((err) => {
          console.error("Kakao code login error:", err);
          setError("카카오 로그인 처리 중 오류가 발생했습니다.");
          showToast("카카오 로그인 처리 중 오류가 발생했습니다.", "error");
        });
    }
  }, [searchParams, login, navigate, onLoginSuccess, showToast, redirectPath]);

  // Window postMessage listener (e.g. popup callback)
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event || !event.data) return;

      let payload = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      if (typeof payload !== "object") return;

      const allowedOrigins = new Set([BACKEND_ORIGIN, window.location.origin, "null"]);
      if (event.origin && !allowedOrigins.has(event.origin)) {
        console.warn("Blocked OAuth message from unexpected origin:", event.origin);
      }

      const { type, token, id, role, provider, email, name } = payload;
      const isOAuthSuccess = type === "OAUTH_SUCCESS" || type === "KAKAO_LOGIN_SUCCESS" || !!token;

      if (isOAuthSuccess && token) {
        const userInfo = {
          email: email || id,
          role: role || "USER",
          provider: provider || "KAKAO",
          name
        };
        login(token, userInfo);
        if (onLoginSuccess) onLoginSuccess();
        navigate(redirectPath);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [BACKEND_ORIGIN, login, navigate, onLoginSuccess, redirectPath]);

  const handleKakaoLogin = () => {
    const popup = window.open(
      kakaoAuthUrl,
      "kakao-login-popup",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      // 팝업이 차단되었으면 현재 창에서 이동
      window.location.href = kakaoAuthUrl;
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>로그인</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FloatingInput
          label="이메일"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FloatingInput
          label="비밀번호"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
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
          onClick={handleKakaoLogin}
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

