import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, MouseEvent } from 'react';
import useImagePreview from './useImagePreview';
import { useToast } from '../context/ToastContext';

export default function useImageSelection(initialUrl = '') {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { preview: filePreview, setPreviewFromFile, clearPreview } = useImagePreview();
  const { showToast } = useToast();
  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
      return;
    }
    setSelectedFile(file);
    setRemoved(false);
    setPreviewFromFile(file);
  };
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleFile(event.target.files?.[0]);
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };
  const removeImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSelectedFile(null);
    setRemoved(true);
    clearPreview();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  return {
    fileInputRef,
    selectedFile,
    isDragging,
    removed,
    preview: filePreview || (removed ? null : initialUrl),
    handleImageChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
  };
}
