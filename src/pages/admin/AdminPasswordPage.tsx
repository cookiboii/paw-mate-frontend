import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import usePageTitle from '../../hooks/usePageTitle';
import FloatingInput from '../../components/FloatingInput';
import { Eye, EyeOff, Lock } from 'lucide-react';
import styles from '../../styles/AdminPasswordPage.module.css';
import { getErrorMessage } from '../../utils/error';
import { passwordChangeSchema, PasswordChangeFormData } from '../../schemas/authSchema';

const AdminPasswordPage: React.FC = () => {
  usePageTitle('관리자 비밀번호 변경');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: PasswordChangeFormData) => {
    setLoading(true);

    try {
      await axios.post('/adoptmate/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      showToast('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.', 'info');
      logout();
      navigate('/login');
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err, '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconBadge}>
          <Lock size={24} />
        </div>
        <div>
          <h2 className={styles.title}>관리자 비밀번호 변경</h2>
          <p className={styles.subtitle}>
            보안을 위해 정기적으로 비밀번호를 변경해 주세요. (계정: {user?.email || 'Admin'})
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* 현재 비밀번호 */}
          <div className={styles.inputWrapper}>
            <FloatingInput
              label="현재 비밀번호"
              type={showCurrent ? 'text' : 'password'}
              error={errors.currentPassword?.message}
              icon={<Lock size={18} />}
              {...register('currentPassword')}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className={styles.eyeBtn}
              aria-label="현재 비밀번호 표시 전환"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* 새 비밀번호 */}
          <div className={styles.inputWrapper}>
            <FloatingInput
              label="새 비밀번호 (8자 이상)"
              type={showNew ? 'text' : 'password'}
              error={errors.newPassword?.message}
              icon={<Lock size={18} />}
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className={styles.eyeBtn}
              aria-label="새 비밀번호 표시 전환"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* 새 비밀번호 확인 */}
          <div className={styles.inputWrapper}>
            <FloatingInput
              label="새 비밀번호 확인"
              type={showConfirm ? 'text' : 'password'}
              error={errors.newPasswordConfirm?.message}
              icon={<Lock size={18} />}
              {...register('newPasswordConfirm')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className={styles.eyeBtn}
              aria-label="새 비밀번호 확인 표시 전환"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
