import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import styles from '../styles/components/EmptyState.module.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
}

/**
 * 🐾 공통 빈 상태(Empty State) 안내 컴포넌트
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
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
        <span className={styles.icon}>{icon || <PawPrint size={44} />}</span>
      </div>
      <div className={styles.pawTrail} aria-hidden="true">
        <PawPrint size={14} />
        <PawPrint size={18} />
        <PawPrint size={14} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      {actionLabel && (actionPath || onAction) && (
        <div className={styles.actionArea}>
          <p className={styles.actionHint}>다른 조건으로 다시 찾아볼까요?</p>
          <button
            className={`btn-primary ${styles.actionBtn}`}
            onClick={handleAction}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
