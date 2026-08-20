import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import styles from '../styles/AdoptionReview.module.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FloatingInput from '../components/FloatingInput';
import Spinner from '../components/Spinner';

const AdoptionReviewEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    imageBase64: ''
  });
  const [preview, setPreview] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // base64 변환 함수
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('로그인이 필요합니다.', 'error');
        navigate('/login');
        return;
      }

      try {
        const userRes = await axios.get('/adoptmate/myInfo');
        const reviewRes = await axios.get(`/post/${id}`);
        const review = reviewRes.data.result;

        // 작성자 확인
        if (userRes.data.email !== review.email) {
          showToast('작성자만 수정할 수 있습니다.', 'error');
          navigate(`/reviews/${id}`);
          return;
        }

        setForm({
          title: review.title,
          content: review.content,
          imageBase64: review.img || ''
        });

        setPreview(review.img || null);
        setIsLoaded(true);
      } catch (err) {
        console.error('❌ 데이터 불러오기 실패:', err);
        showToast('리뷰 정보를 불러오는 데 실패했습니다.', 'error');
        navigate('/reviews');
      }
    };

    fetchData();
  }, [id, navigate, showToast]);

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
    e.stopPropagation();
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
      await axios.put(
        `/post/${id}`,
        {
          title: form.title,
          content: form.content,
          img: form.imageBase64
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showToast('후기가 성공적으로 수정되었습니다!', 'success');
      navigate(`/reviews/${id}`);
    } catch (error) {
      console.error('❌ 수정 실패:', error);
      showToast('수정 중 오류가 발생했습니다.', 'error');
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isLoaded) return <div className={styles.pageWrapper}><Spinner /></div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>입양 후기 수정</h2>
          <p>등록하신 후기 내용을 수정합니다.</p>
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
            수정 완료하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdoptionReviewEdit;
