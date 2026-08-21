import React, { useState, useRef } from 'react';
import styles from '../styles/AdoptionReview.module.css';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import FloatingInput from '../components/FloatingInput';

const AdoptionReview = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    content: '',
    imageBase64: '',
    title: '',
  });
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFile = async (file) => {
    if (file && file.type.startsWith('image/')) {
      const base64 = await toBase64(file);
      setForm((prev) => ({ ...prev, imageBase64: base64 }));
      setPreview(base64);
    } else {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const removeImage = (e) => {
    e.stopPropagation(); // Prevent clicking the box underneath
    setForm((prev) => ({ ...prev, imageBase64: '' }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.content || !form.title) {
      return showToast('제목과 내용을 모두 입력해주세요.', 'error');
    }

    try {
      // 📌 백엔드 PostCreateRequestDto: title, content, img, name, dateTime
      await axios.post(
        '/post/create',
        {
          title: form.title,
          content: form.content,
          img: form.imageBase64,
          name: user?.name || '익명',
          dateTime: new Date().toISOString(),
        }
      );
      showToast('후기가 성공적으로 등록되었습니다!', 'success');
      setForm({ title: '', content: '', imageBase64: '' });
      setPreview(null);
      navigate('/reviews'); // 작성 후 목록으로 이동
    } catch (error) {
      console.error('후기 등록 실패:', error);
      showToast('등록 중 오류가 발생했습니다: ' + (error.response?.data?.statusMessage || error.response?.data?.message || '다시 시도해 주세요.'), 'error');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>입양 후기 작성</h2>
          <p>새로운 가족과 함께하는 따뜻한 이야기를 들려주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <FloatingInput
              label="글 제목"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>사진 첨부</label>
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
                style={{ display: 'none' }}
              />
              
              {preview ? (
                <div className={styles.previewContainer}>
                  <img src={preview} alt="미리보기" className={styles.previewImage} />
                  <button type="button" className={styles.removeBtn} onClick={removeImage}>
                    ✕
                  </button>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <span className={styles.uploadIcon}>📸</span>
                  <p><strong>클릭</strong>하여 사진을 선택하거나<br/>여기로 <strong>드래그 앤 드롭</strong> 하세요</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>상세 내용</label>
            <textarea
              name="content"
              className={styles.textarea}
              placeholder="반려동물과의 소중한 추억을 자유롭게 적어주세요!"
              value={form.content}
              onChange={handleChange}
              rows={8}
              required
            />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            이야기 등록하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdoptionReview;
