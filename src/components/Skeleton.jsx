import React from 'react';
import styles from '../styles/Skeleton.module.css';

const Skeleton = ({ type = 'text', width, height, className = '' }) => {
  const inlineStyles = {};
  if (width) inlineStyles.width = width;
  if (height) inlineStyles.height = height;

  return (
    <div
      className={`${styles.skeleton} ${styles[type]} ${className} shimmer`}
      style={inlineStyles}
    ></div>
  );
};

export default Skeleton;
