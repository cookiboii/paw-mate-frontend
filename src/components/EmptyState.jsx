import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/EmptyState.module.css';

/**
 * 🐾 공통 빈 상태(Empty State) 안내 컴포넌트
 */
const EmptyState = ({ 
  icon = '🐾', 
  title = '데이터가 없습니다.', 
  description = '요청하신 정보가 아직 등록되지 않았습니다.', 
  actionLabel, 
  actionPath,
  onAction,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div className={styles.emptyStateContainer}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      
      {actionLabel && (actionPath || onAction) && (
        <button 
          className="btn-primary" 
          onClick={handleAction}
          style={{ marginTop: '24px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
