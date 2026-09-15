import ConfirmModal from '../ConfirmModal';
import { STATUS_OPTIONS } from '../../constants/animal';
import styles from '../../styles/pages/AnimalDetail.module.css';
interface Props {
  isStatusModalOpen: boolean;
  isUpdatingStatus: boolean;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  handleStatusChangeSubmit: () => Promise<void>;
  onClose: () => void;
}
export default function AnimalStatusModal({ isStatusModalOpen, isUpdatingStatus, selectedStatus, setSelectedStatus, handleStatusChangeSubmit, onClose }: Props) {
  return (
    <ConfirmModal
      isOpen={isStatusModalOpen}
      title="동물 보호 상태 변경"
      message="변경할 보호 상태를 선택해주세요."
      confirmText={isUpdatingStatus ? '저장 중...' : '상태 변경 저장'}
      cancelText="취소"
      onConfirm={handleStatusChangeSubmit}
      onCancel={onClose}
    >
      <div className={styles.statusModalContent}>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={styles.statusSelect}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </ConfirmModal>
  );
}
