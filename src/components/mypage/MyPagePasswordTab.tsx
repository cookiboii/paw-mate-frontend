import styles from '../../styles/pages/MyPage.module.css';
import type { ChangeEvent, FormEvent } from 'react';

interface Props {
  form: { passwd: string; new_passwd: string; new_passwd_confirm: string };
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleChangePassword: (event: FormEvent) => void;
}

export default function MyPagePasswordTab({ form, handleChange, handleChangePassword }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>보안 설정</h3>
        <p>주기적인 비밀번호 변경으로 계정을 안전하게 보호하세요.</p>
      </div>
      <form className={styles.passwordForm} onSubmit={handleChangePassword}>
        <div className={styles.formGroup}>
          <label>현재 비밀번호</label>
          <input
            type="password"
            name="passwd"
            value={form.passwd}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>새 비밀번호</label>
          <input
            type="password"
            name="new_passwd"
            value={form.new_passwd}
            onChange={handleChange}
            required
          />
          <span className={styles.helpText}>6자 이상</span>
        </div>
        <div className={styles.formGroup}>
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            name="new_passwd_confirm"
            value={form.new_passwd_confirm}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className={`btn-primary ${styles.submitBtnMargin}`}>
          비밀번호 변경
        </button>
      </form>
    </section>
  );
}
