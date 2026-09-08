import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from '../styles/components/ImageLightboxModal.module.css';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl?: string;
  alt?: string;
  caption?: string;
  onClose: () => void;
}

const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  alt = '확대 이미지',
  caption,
  onClose,
}) => {
  // ESC 키 이벤트 및 배경 스크롤 제어
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 크게 보기"
    >
      <button
        type="button"
        className={styles.closeBtn}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="닫기"
      >
        <X size={24} />
      </button>

      <div
        className={styles.imageWrapper}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          className={styles.lightboxImage}
        />
        {(caption || alt) && (
          <p className={styles.caption}>{caption || alt}</p>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ImageLightboxModal;
