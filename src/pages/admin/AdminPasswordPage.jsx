import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import usePageTitle from '../../hooks/usePageTitle';
import FloatingInput from '../../components/FloatingInput';
import { EyeIcon, EyeOffIcon, LockIcon } from '../../components/Icons';
import styles from '../../styles/AdminPasswordPage.module.css';

const AdminPasswordPage = () => {
  usePageTitle('관리자 비밀번호 변경');
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword) {
      showToast('현재 비밀번호를 입력해주세요.', 'error');
      return;
    }

    if (form.newPassword.length < 8) {
      showToast('새 비밀번호는 8자 이상이어야 합니다.', 'error');
      return;
    }

    if (form.newPassword !== form.newPasswordConfirm) {
      showToast('새 비밀번호 확인이 일치하지 않습니다.', 'error');
      return;
    }

    if (form.currentPassword === form.newPassword) {
      showToast('현재 비밀번호와 다른 새로운 비밀번호를 입력해주세요.', 'error');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/adoptmate/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      showToast('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.', 'info');
      logout();
      navigate('/login');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconBadge}>
          <LockIcon size={24} />
        </div>
        <div>
          <h2 className={styles.title}>관리자 비밀번호 변경</h2>
          <p className={styles.subtitle}>
            보안을 위해 정기적으로 비밀번호를 변경해 주세요. (계정: {user?.email || 'Admin'})
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 현재 비밀번호 */}
          <div style={{ position: 'relative' }}>
            <FloatingInput
              label="현재 비밀번호"
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              icon={<LockIcon />}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className={styles.eyeBtn}
              aria-label="현재 비밀번호 표시 전환"
            >
              {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* 새 비밀번호 */}
          <div style={{ position: 'relative' }}>
            <FloatingInput
              label="새 비밀번호 (8자 이상)"
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              icon={<LockIcon />}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className={styles.eyeBtn}
              aria-label="새 비밀번호 표시 전환"
            >
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* 새 비밀번호 확인 */}
          <div style={{ position: 'relative' }}>
            <FloatingInput
              label="새 비밀번호 확인"
              type={showConfirm ? 'text' : 'password'}
              name="newPasswordConfirm"
              value={form.newPasswordConfirm}
              onChange={handleChange}
              required
              icon={<LockIcon />}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className={styles.eyeBtn}
              aria-label="새 비밀번호 확인 표시 전환"
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '변경 처리 중...' : '비밀번호 변경 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPasswordPage;
