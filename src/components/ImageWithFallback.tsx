import React, { useState, ImgHTMLAttributes, CSSProperties } from 'react';

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
  style = {},
  aspectRatio,
  fetchPriority = 'auto',
  loading = 'lazy',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 'inherit',
    backgroundColor: 'var(--bg-secondary, rgba(0, 0, 0, 0.04))',
    aspectRatio: aspectRatio ? String(aspectRatio) : undefined,
  };

  if (!src || hasError) {
    return (
      <div
        className={className}
        style={{
          ...containerStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-secondary, rgba(0, 0, 0, 0.04))',
          color: 'var(--text-muted, #888)',
          border: '1px dashed var(--border-color, rgba(0, 0, 0, 0.1))',
          minHeight: '120px',
          gap: '8px',
          padding: '16px',
          boxSizing: 'border-box',
          userSelect: 'none',
          ...style,
        }}
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
          style={{ opacity: 0.6 }}
        >
          <path d="M10 5.172C10 3.972 10.972 3 12.172 3c1.2 0 2.172.972 2.172 2.172 0 1.2-.972 2.172-2.172 2.172C10.972 7.344 10 6.372 10 5.172z" />
          <path d="M4.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5z" />
          <path d="M14.5 10.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5z" />
          <path d="M12 14c-3.314 0-6 2.686-6 6h12c0-3.314-2.686-6-6-6z" />
        </svg>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #888)', textAlign: 'center', wordBreak: 'keep-all' }}>
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, rgba(200,200,200,0.12) 0%, rgba(200,200,200,0.28) 50%, rgba(200,200,200,0.12) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite ease-in-out',
            zIndex: 1,
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.4s ease, filter 0.4s ease',
          opacity: isLoading ? 0 : 1,
          filter: isLoading ? 'blur(8px)' : 'none',
          ...style,
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading={loading}
        decoding="async"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ fetchpriority: fetchPriority } as any)}
        {...props}
      />
    </div>
  );
};

export default React.memo(ImageWithFallback);
