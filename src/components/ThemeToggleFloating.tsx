import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import styles from '../styles/ThemeToggleFloating.module.css';

const ThemeToggleFloating: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.floatingBtn}
      onClick={toggleTheme}
      aria-label="테마 전환 (라이트/다크 모드)"
      title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
    >
      <span className={styles.icon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </span>
      <span className={styles.tooltip}>{theme === 'light' ? '다크 모드' : '라이트 모드'}</span>
    </button>
  );
};

export default ThemeToggleFloating;
