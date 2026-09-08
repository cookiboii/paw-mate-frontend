import React, { useState, ImgHTMLAttributes, CSSProperties } from 'react';
import styles from '../styles/ImageWithFallback.module.css';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
  style?: CSSProperties;
  aspectRatio?: string | number;
  fetchPriority?: 'high' | 'low' | 'auto';
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '반려동물 이미지',
  fallbackText = '사진 준비 중',
  className = '',
  style,
  aspectRatio,
  fetchPriority = 'auto',
  loading = 'lazy',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const containerDynamicStyle: CSSProperties | undefined = aspectRatio
    ? { aspectRatio: String(aspectRatio) }
    : undefined;

  if (!src || hasError) {
    return (
      <div
        className={`${styles.fallbackWrapper} ${className}`.trim()}
        style={{ ...containerDynamicStyle, ...style }}
      >
        <svg
          viewBox="0 0 24 24"
          width="36"
          height="36"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.fallbackIcon}
        >
          <path d="M10 5.172C10 3.972 10.972 3 12.172 3c1.2 0 2.172.972 2.172 2.172 0 1.2-.972 2.172-2.172 2.172C10.972 7.344 10 6.372 10 5.172z" />
          <path d="M4.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5z" />
          <path d="M14.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5z" />
          <path d="M12 14c-3.314 0-6 2.686-6 6h12c0-3.314-2.686-6-6-6z" />
        </svg>
        <span className={styles.fallbackText}>{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={styles.container} style={containerDynamicStyle}>
      {isLoading && <div className={styles.shimmer} />}
      <img
        src={src}
        alt={alt}
        className={`${styles.image} ${isLoading ? styles.imageLoading : styles.imageLoaded} ${className}`.trim()}
        style={style}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        {...props}
      />
    </div>
  );
};

export default React.memo(ImageWithFallback);
