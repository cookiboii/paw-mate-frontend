import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import styles from "../styles/pages/Login.module.css";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FloatingInput from "../components/FloatingInput";
import kakaoLoginImg from "../assets/kakao_login_medium_narrow.png";
import axios from "../api/axiosInstance";
import usePageTitle from "../hooks/usePageTitle";
import { getErrorMessage } from "../utils/error";

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  usePageTitle('로그인');
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();

  const locationState = location.state as { from?: string } | null;
  const redirectPath = locationState?.from || "/";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app";
  const BACKEND_ORIGIN = API_BASE_URL ? new URL(API_BASE_URL).origin : window.location.origin;

  const kakaoAuthUrl = `${API_BASE_URL.replace(/\/$/, '')}/oauth2/authorization/kakao`;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      const resData = res.data?.result || res.data?.data || res.data || {};
      const token = resData.token || resData.accessToken;
      const refreshToken = resData.refreshToken || resData.refresh_token;
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
    } catch (err: unknown) {
      console.error(err);
      const errMsg = getErrorMessage(err, "로그인에 실패했습니다.");
      setError(errMsg);
      showToast(errMsg, "error");
    }
  };

  // URL search params check (e.g. redirected to /login?token=... or ?code=...)
  useEffect(() => {
    const urlToken = searchParams.get("token") || searchParams.get("accessToken");
    const urlRole = searchParams.get("role") || "USER";
    const urlEmail = searchParams.get("email") || searchParams.get("id") || undefined;
    const urlName = searchParams.get("name") || undefined;
    const urlCode = searchParams.get("code");

    const urlRefreshToken = searchParams.get("refreshToken") || undefined;

    if (urlToken) {
      const userInfo = { email: urlEmail, role: urlRole, name: urlName, provider: "KAKAO" };
      login(urlToken, userInfo, urlRefreshToken);
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
          const token = resData?.token || resData?.accessToken || resData?.result?.token || resData?.result?.accessToken || resData?.data?.token || resData?.data?.accessToken;
          const refreshToken = resData?.refreshToken || resData?.refresh_token || resData?.result?.refreshToken || resData?.result?.refresh_token || resData?.data?.refreshToken || resData?.data?.refresh_token;
          const role = resData?.role || resData?.result?.role || resData?.data?.role || "USER";
          const email = resData?.email || resData?.result?.email || resData?.data?.email || resData?.id;
          const name = resData?.name || resData?.result?.name;
          if (token) {
            login(token, { email, role, name, provider: "KAKAO" }, refreshToken);
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
    const handleMessage = (event: MessageEvent) => {
      if (!event || !event.data) return;

      let payload = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      if (!payload || typeof payload !== "object") return;
      if (event.origin !== BACKEND_ORIGIN) return;

      const { type, token: messageToken, accessToken, id, role, provider, email, name, refreshToken } = payload;
      const token = messageToken || accessToken;
      const isOAuthSuccess = type === "OAUTH_SUCCESS";

      if (isOAuthSuccess && typeof token === "string" && token) {
        const userInfo = {
          email: email || id,
          role: role || "USER",
          provider: provider || "KAKAO",
          name
        };
        login(token, userInfo, refreshToken);
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
      showToast('카카오 로그인을 위해 팝업을 허용한 뒤 다시 시도해 주세요.', 'info');
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
        <button type="button" onClick={() => navigate("/forgot-password")} className={styles.link}>
          비밀번호를 잊으셨나요?
        </button>
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
        <button type="button" className={styles.signupLink} onClick={() => navigate("/register")}>
          회원가입
        </button>
      </p>
    </div>
  );
};

export default Login;
