import React, { useEffect, useState, useRef, ChangeEvent, FormEvent, DragEvent, MouseEvent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import styles from '../styles/AdoptionReview.module.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FloatingInput from '../components/FloatingInput';
import Spinner from '../components/Spinner';
import { CATEGORY_PREFIX, getCategoryFromTitle, getCleanTitle } from './AdoptionReviewListPage';
import { uploadImageToBlob } from '../utils/imageUpload';

const CATEGORY_OPTIONS = [
  { key: 'REVIEW', label: '💌 입양 후기', prefix: CATEGORY_PREFIX.REVIEW },
  { key: 'FREE_ADOPTION', label: '🎁 무료 분양', prefix: CATEGORY_PREFIX.FREE_ADOPTION },
  { key: 'REPORT', label: '🚨 유기동물 제보', prefix: CATEGORY_PREFIX.REPORT },
];

const AdoptionReviewEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('REVIEW');
  const [form, setForm] = useState({
    title: '',
    content: '',
    img: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('로그인이 필요합니다.', 'error');
        navigate('/login');
        return;
      }

      try {
        const [userRes, reviewRes] = await Promise.all([
          axios.get('/adoptmate/myInfo'),
          axios.get(`/post/${id}`),
        ]);
        const user = userRes.data.result || userRes.data;
        const review = reviewRes.data.result || reviewRes.data;

        const userEmail = (user?.email || '').trim().toLowerCase();
        const authorEmail = (review?.email || '').trim().toLowerCase();
        const userRole = (user?.role || '').trim().toUpperCase();

        if (userEmail !== authorEmail && userRole !== 'ADMIN') {
          showToast('작성자 또는 관리자만 수정할 수 있습니다.', 'error');
          navigate(`/reviews/${id}`);
          return;
        }

        // 카테고리 파싱
        const parsedCategory = getCategoryFromTitle(review.title || '');
        const cleanTitle = getCleanTitle(review.title || '');

        setSelectedCategory(parsedCategory);
        setForm({
          title: cleanTitle,
          content: review.content || '',
          img: review.img || '',
        });

        setPreview(review.img || null);
        setIsLoaded(true);
      } catch (err) {
        console.error('❌ 데이터 불러오기 실패:', err);
        showToast('게시글 정보를 불러오는 데 실패했습니다.', 'error');
        navigate('/reviews');
      }
    };

    fetchData();
  }, [id, navigate, showToast]);

  const handleFile = (file?: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const removeImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelectedFile(null);
    setForm((prev) => ({ ...prev, img: '' }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      return showToast('제목과 내용을 모두 입력해주세요.', 'error');
    }

    const activeCat = CATEGORY_OPTIONS.find((c) => c.key === selectedCategory) || CATEGORY_OPTIONS[0];
    const finalTitle = `${activeCat.prefix} ${form.title.trim()}`;

    try {
      let uploadedImageUrl = form.img;
      if (selectedFile) {
        uploadedImageUrl = await uploadImageToBlob(selectedFile);
      }

      await axios.put(
        `/post/${id}`,
        {
          title: finalTitle,
          content: form.content,
          img: uploadedImageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      showToast('게시글이 성공적으로 수정되었습니다!', 'success');
      navigate(`/reviews/${id}`);
    } catch (error) {
      console.error('❌ 수정 실패:', error);
      showToast('수정 중 오류가 발생했습니다.', 'error');
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isLoaded) return <div className={styles.pageWrapper}><Spinner /></div>;

  const activeCat = CATEGORY_OPTIONS.find((c) => c.key === selectedCategory) || CATEGORY_OPTIONS[0];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        {/* 카테고리 선택 탭 */}
        <div className={styles.categoryTabs}>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`${styles.categoryTab} ${selectedCategory === cat.key ? styles.categoryTabActive : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 헤더 */}
        <div
          className={`${styles.cardHeader} ${
            selectedCategory === 'REPORT'
              ? styles.cardHeaderReport
              : selectedCategory === 'FREE_ADOPTION'
              ? styles.cardHeaderFreeAdoption
              : ''
          }`}
        >
          <h2>게시글 수정</h2>
          <p>{activeCat?.label} 내용을 수정합니다.</p>
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
                  <button type="button" className={styles.removeBtn} onClick={removeImage}>✕</button>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <span className={styles.uploadIcon}>📸</span>
                  <p><strong>클릭</strong>하여 사진을 선택하거나<br />여기로 <strong>드래그 앤 드롭</strong> 하세요</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>상세 내용</label>
            <textarea
              name="content"
              className={styles.textarea}
              placeholder={
                selectedCategory === 'REPORT'
                  ? '발견 장소, 시간, 동물 상태, 부상 여부 등을 자세히 적어주세요...'
                  : selectedCategory === 'FREE_ADOPTION'
                  ? '아이의 성격, 특징, 배변 훈련 여부, 원하는 입양자 조건 등을 자세히 적어주세요...'
                  : '반려동물과의 소중한 추억을 자유롭게 적어주세요!'
              }
              value={form.content}
              onChange={handleChange}
              rows={8}
              required
            />
          </div>

          <button
            type="submit"
            className={`${
              selectedCategory === 'REPORT'
                ? styles.submitBtnReport
                : selectedCategory === 'FREE_ADOPTION'
                ? styles.submitBtnFreeAdoption
                : 'btn-primary'
            } ${styles.submitBtn}`}
          >
            수정 완료하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdoptionReviewEdit;
