import React, { useState, InputHTMLAttributes, ReactNode } from 'react';
import styles from '../styles/FloatingInput.module.css';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  required = false,
  error = '',
  icon,
  children,
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isFocused || (value !== undefined && value !== null && value.toString().trim() !== '');

  return (
    <div className={`${styles.inputGroup} ${error ? styles.hasError : ''}`}>
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          className={`${styles.input} ${isActive ? styles.active : ''} ${icon ? styles.hasIcon : ''}`}
          {...props}
        />
        <label
          htmlFor={name}
          className={`${styles.label} ${isActive ? styles.floating : ''} ${icon ? styles.labelWithIcon : ''}`}
        >
          {label}
        </label>
        {children}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default FloatingInput;
