import React, { useEffect, useState } from 'react';
import styles from '../styles/Toast.module.css';
import { useToast } from '../context/ToastContext';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Start exit animation slightly before it is removed from context
    const timer = setTimeout(() => {
      setIsRemoving(true);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div className={`${styles.toast} ${styles[toast.type]} ${isRemoving ? styles.removing : ''}`} onClick={() => removeToast(toast.id)}>
      <span className={styles.icon}>{icons[toast.type] || icons.info}</span>
      <span className={styles.message}>{toast.message}</span>
    </div>
  );
};

export default Toast;
