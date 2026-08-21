import React, { useEffect } from 'react';
import styles from '../styles/ConfirmModal.module.css';

/**
 * window.confirm() 을 대체하는 커스텀 확인 모달
 * @param {boolean}  isOpen     - 모달 표시 여부
 * @param {string}   title      - 제목
 * @param {string}   message    - 메시지
 * @param {string}   confirmText  - 확인 버튼 텍스트 (default: '확인')
 * @param {string}   cancelText   - 취소 버튼 텍스트 (default: '취소')
 * @param {string}   variant    - 'danger' | 'default'
 * @param {Function} onConfirm  - 확인 클릭 콜백
 * @param {Function} onCancel   - 취소 / 닫기 콜백
 */
const ConfirmModal = ({
  isOpen,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  // 열려있을 때 배경 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.iconWrapper} ${variant === 'danger' ? styles.iconDanger : styles.iconDefault}`}>
          {variant === 'danger' ? '⚠️' : 'ℹ️'}
        </div>
        <h3 id="confirm-title" className={styles.title}>{title}</h3>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`${styles.confirmBtn} ${variant === 'danger' ? styles.confirmDanger : styles.confirmDefault}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
