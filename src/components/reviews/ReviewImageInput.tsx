import { AlertTriangle, Gift, Camera, X } from 'lucide-react';
import useImageSelection from '../../hooks/useImageSelection';
import type { PostCategory } from '../../types/review';
import styles from '../../styles/pages/AdoptionReview.module.css';
interface Props {
  selection: ReturnType<typeof useImageSelection>;
  selectedCategory: PostCategory;
  isEditing: boolean;
}
export default function ReviewImageInput({ selection, selectedCategory, isEditing }: Props) {
  const {
    fileInputRef,
    isDragging,
    preview,
    handleImageChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
  } = selection;
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        사진 첨부
        {selectedCategory === 'REPORT' || selectedCategory === 'FREE_ADOPTION'
          ? ' (강력 권장)'
          : ''}
      </label>
      <div
        className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''} ${preview ? styles.hasPreview : ''}`}
        onClick={() => !preview && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className={styles.hiddenFileInput}
        />
        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt="미리보기" className={styles.previewImage} />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={removeImage}
              aria-label="사진 삭제"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className={styles.uploadPlaceholder}>
            <span
              className={`${styles.uploadIcon} ${selectedCategory === 'REPORT' ? styles.iconReport : selectedCategory === 'FREE_ADOPTION' ? styles.iconFreeAdoption : ''}`}
            >
              {selectedCategory === 'REPORT' ? (
                <AlertTriangle size={36} />
              ) : selectedCategory === 'FREE_ADOPTION' ? (
                <Gift size={36} />
              ) : (
                <Camera size={36} />
              )}
            </span>
            <p>
              <strong>클릭</strong>하여 사진을 선택하거나
              <br />
              여기로 <strong>드래그 앤 드롭</strong> 하세요
            </p>
            {!isEditing && selectedCategory === 'REPORT' && (
              <p className={styles.uploadReportTip}>
                현장 사진을 첨부하면 빠른 구조에 도움이 됩니다
              </p>
            )}
            {!isEditing && selectedCategory === 'FREE_ADOPTION' && (
              <p className={styles.uploadAdoptionTip}>
                아이의 매력이 돋보이는 선명한 사진을 올려주세요
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
