import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import styles from '../styles/components/ThemeToggleFloating.module.css';

const ThemeToggleFloating: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.floatingBtn}
      onClick={toggleTheme}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <span className={styles.iconWrapper}>
        {isDark ? (
          <Sun size={19} className={styles.sunIcon} />
        ) : (
          <Moon size={18} className={styles.moonIcon} />
        )}
      </span>
      <span className={styles.tooltip}>
        {isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      </span>
    </button>
  );
};

export default ThemeToggleFloating;
