import React, { useState, forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import styles from '../styles/components/FloatingInput.module.css';

export interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      type = 'text',
      name,
      value,
      onChange,
      onFocus,
      onBlur,
      required = false,
      error = '',
      icon,
      children,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = value !== undefined && value !== null && value.toString().trim() !== '';
    const isActive = isFocused || hasValue;

    return (
      <div className={`${styles.inputGroup} ${error ? styles.hasError : ''}`}>
        <div className={styles.inputWrapper}>
          {icon && <span className={styles.inputIcon}>{icon}</span>}
          <input
            ref={ref}
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            required={required}
            disabled={disabled}
            {...props}
            className={`${styles.input} ${isActive ? styles.active : ''} ${icon ? styles.hasIcon : ''} ${className}`}
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
  }
);

FloatingInput.displayName = 'FloatingInput';

export default FloatingInput;
