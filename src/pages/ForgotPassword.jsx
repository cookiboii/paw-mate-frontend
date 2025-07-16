import React, { useState } from "react";
import axios from "../api/axiosInstance";
import styles from "../styles/ForgotPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: 이메일 전송, 2: 인증 코드 확인, 3: 비밀번호 변경
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post("/adoptmate/send-reset-code", null, {
        params: { email },
      });
      setMessage("📧 인증코드가 이메일로 전송되었습니다.");
      setStep(2);
    } catch (err) {
      setMessage("❌ 이메일 전송 실패 또는 존재하지 않는 계정입니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post("/adoptmate/verify-reset-code", null, {
        params: { email, code },
      });
      setMessage("✅ 인증 성공! 새 비밀번호를 입력해주세요.");
      setStep(3);
    } catch (err) {
      setMessage("❌ 인증 실패: " + (err.response?.data || "오류 발생"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.patch("/adoptmate/password", {
        email,
        password: newPassword,
      });
      setMessage("🎉 비밀번호가 성공적으로 변경되었습니다.");
      setStep(1);
      setEmail("");
      setCode("");
      setNewPassword("");
    } catch (err) {
      setMessage("❌ 비밀번호 변경 실패: " + (err.response?.data || "오류 발생"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>비밀번호 찾기</h2>

      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="가입한 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "전송 중..." : "이메일 전송"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleCodeVerify} className={styles.form}>
          <input
            type="text"
            placeholder="인증 코드"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "확인 중..." : "코드 확인"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordReset} className={styles.form}>
          <input
            type="password"
            placeholder="새 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
