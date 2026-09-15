import styles from '../../styles/pages/AnimalDetail.module.css';
import { Edit3, Trash2 } from 'lucide-react';

interface Props {
  isAdmin: boolean;
  isDeleting: boolean;
  setIsStatusModalOpen: (open: boolean) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
}

export default function AnimalAdminActions({
  isAdmin,
  isDeleting,
  setIsStatusModalOpen,
  setIsDeleteModalOpen,
}: Props) {
  return (
    <>
      {isAdmin && (
        <div className={styles.adminButtons}>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => setIsStatusModalOpen(true)}
          >
            <Edit3 size={16} />
            <span>상태 변경</span>
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
          </button>
        </div>
      )}
    </>
  );
}
