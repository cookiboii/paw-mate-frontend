import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../styles/Login.module.css";
import { loginUser } from "../api/user";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import kakaoLoginImg from "../assets/kakao_login_medium_narrow.png";
import axios from "../api/axiosInstance";

const Login = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { addToast } = useToast();

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
      const token = res.data?.token || res.data?.data?.token || res.data?.result?.token || res.token || res.result?.token;
      const role = res.data?.role || res.data?.data?.role || res.data?.result?.role || res.role || res.result?.role || "USER";
      const email = res.data?.email || res.data?.data?.email || res.data?.result?.email || res.email || res.result?.email || form.email;
      const name = res.data?.name || res.data?.data?.name || res.data?.result?.name || res.name;

      if (!token) {
        setError("로그인 응답에 토큰이 없습니다.");
        return;
      }

      const userInfo = { email, role, name, provider: "LOCAL" };
      login(token, userInfo);
      addToast("로그인 성공!", "success");
      if (onLoginSuccess) onLoginSuccess();
      navigate("/");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.response?.data?.statusMessage || "로그인에 실패했습니다.";
      setError(errMsg);
      addToast(errMsg, "error");
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
      addToast("카카오 로그인 성공!", "success");
      if (onLoginSuccess) onLoginSuccess();
      navigate("/", { replace: true });
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
            addToast("카카오 로그인 성공!", "success");
            if (onLoginSuccess) onLoginSuccess();
            navigate("/", { replace: true });
          }
        })
        .catch((err) => {
          console.error("Kakao code login error:", err);
          setError("카카오 로그인 처리 중 오류가 발생했습니다.");
          addToast("카카오 로그인 처리 중 오류가 발생했습니다.", "error");
        });
    }
  }, [searchParams, login, navigate, onLoginSuccess, addToast]);

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
        addToast("카카오 로그인 성공!", "success");
        if (onLoginSuccess) onLoginSuccess();
        navigate("/");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [BACKEND_ORIGIN, login, navigate, onLoginSuccess, addToast]);

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

