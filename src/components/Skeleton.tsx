import React, { CSSProperties } from 'react';
import styles from '../styles/Skeleton.module.css';

interface SkeletonProps {
  type?: 'text' | 'title' | 'avatar' | 'image' | 'card' | 'badge';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ type = 'text', width, height, className = '' }) => {
  const inlineStyles: CSSProperties = {};
  if (width) inlineStyles.width = typeof width === 'number' ? `${width}px` : width;
  if (height) inlineStyles.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${styles.skeleton} ${styles[type] || ''} ${className} shimmer`}
      style={inlineStyles}
    ></div>
  );
};

export default Skeleton;
