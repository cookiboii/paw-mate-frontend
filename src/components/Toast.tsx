import React, { useEffect, useState } from 'react';
import styles from '../styles/Toast.module.css';
import { useToast } from '../context/ToastContext';
import { ToastItem, ToastType } from '../types/common';

const ToastIcon: React.FC<{ type?: ToastType }> = ({ type }) => {
  switch (type) {
    case 'success':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'error':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case 'warning':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
};

interface ToastProps {
  toast: ToastItem;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Start exit animation slightly before it is removed from context
    const timer = setTimeout(() => {
      setIsRemoving(true);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`${styles.toast} ${styles[toast.type || 'info']} ${isRemoving ? styles.removing : ''}`}
      onClick={() => removeToast(toast.id)}
      role="alert"
      aria-live={toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'}
    >

      <div className={styles.iconWrapper}>
        <ToastIcon type={toast.type} />
      </div>
      <div className={styles.messageContent}>
        <span className={styles.message}>{toast.message}</span>
      </div>
      <button
        className={styles.closeButton}
        onClick={(e) => {
          e.stopPropagation();
          removeToast(toast.id);
        }}
        aria-label="닫기"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
