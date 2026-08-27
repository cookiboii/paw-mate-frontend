import React, { useState, useRef, ChangeEvent, FormEvent, DragEvent, MouseEvent } from 'react';
import styles from '../styles/AdoptionReview.module.css';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import FloatingInput from '../components/FloatingInput';
import { CATEGORY_PREFIX } from './AdoptionReviewListPage';
import usePageTitle from '../hooks/usePageTitle';

const CATEGORY_OPTIONS = [
  { key: 'REVIEW', label: '💌 입양 후기', desc: '입양 후 반려동물과의 소중한 이야기를 공유해요', prefix: CATEGORY_PREFIX.REVIEW },
  { key: 'FREE_ADOPTION', label: '🎁 무료 분양', desc: '새로운 가족을 찾는 아이들의 무료 분양 글을 등록해요 (상업적 분양 금지)', prefix: CATEGORY_PREFIX.FREE_ADOPTION },
  { key: 'REPORT', label: '🚨 유기동물 제보', desc: '유기·학대 동물을 목격했다면 알려주세요', prefix: CATEGORY_PREFIX.REPORT },
];

const AdoptionReview: React.FC = () => {
  usePageTitle('후기 / 제보 작성');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('REVIEW');
  const [form, setForm] = useState({
    content: '',
    imageBase64: '',
    title: '',
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const activeCat = CATEGORY_OPTIONS.find((c) => c.key === selectedCategory) || CATEGORY_OPTIONS[0];

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFile = async (file?: File) => {
    if (file && file.type.startsWith('image/')) {
      const base64 = await toBase64(file);
      setForm((prev) => ({ ...prev, imageBase64: base64 }));
      setPreview(base64);
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
    setForm((prev) => ({ ...prev, imageBase64: '' }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) return showToast('제목을 입력해주세요.', 'error');
    if (!form.content.trim()) return showToast('내용을 입력해주세요.', 'error');
    if (isSubmitting) return;

    setIsSubmitting(true);

    // 제목에 카테고리 접두사를 붙여 저장
    const finalTitle = `${activeCat.prefix} ${form.title.trim()}`;

    try {
      await axios.post('/post/create', {
        title: finalTitle,
        content: form.content,
        img: form.imageBase64,
        name: user?.name || '익명',
        dateTime: new Date().toISOString(),
      });
      showToast(
        selectedCategory === 'REPORT'
          ? '🚨 유기동물 제보가 등록되었습니다. 빠른 도움이 이어지길 바랍니다!'
          : selectedCategory === 'FREE_ADOPTION'
          ? '🎁 무료 분양 글이 등록되었습니다. 좋은 가족을 만나길 응원합니다!'
          : '💌 입양 후기가 등록되었습니다!',
        'success'
      );
      setForm({ title: '', content: '', imageBase64: '' });
      setPreview(null);
      navigate('/reviews');
    } catch (error: any) {
      console.error('글 등록 실패:', error);
      showToast(
        '등록 중 오류가 발생했습니다: ' +
          (error.response?.data?.statusMessage || error.response?.data?.message || '다시 시도해 주세요.'),
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2>{activeCat?.label}</h2>
          <p>{activeCat?.desc}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 제목 */}
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

          {/* 유기동물 제보 전용 안내 배너 */}
          {selectedCategory === 'REPORT' && (
            <div className={styles.reportGuide}>
              <strong>🚨 제보 시 포함해주세요</strong>
              <ul>
                <li>📍 <strong>위치</strong>: 발견 장소 (시/구/동 또는 주요 건물명)</li>
                <li>📅 <strong>시간</strong>: 발견 일시</li>
                <li>🐾 <strong>상태</strong>: 동물 종류, 외형, 부상 여부</li>
                <li>📞 <strong>연락처</strong> (선택): 제보자 연락 가능 여부</li>
              </ul>
              <p className={styles.reportEmergency}>긴급 구조가 필요한 경우 <strong>동물보호 상담전화 1577-0954</strong>로 연락하세요.</p>
            </div>
          )}

          {/* 무료 분양 전용 안내 배너 */}
          {selectedCategory === 'FREE_ADOPTION' && (
            <div className={styles.freeAdoptionGuide}>
              <strong>🎁 무료 분양 등록 안내</strong>
              <ul>
                <li>🐾 <strong>아이 정보</strong>: 품종, 나이, 성별, 건강 상태 (예방접종 / 중성화 여부)</li>
                <li>📍 <strong>지역</strong>: 분양 가능 지역 (직거래 권장)</li>
                <li>❤️ <strong>입양 조건</strong>: 가족 구성원 동의, 주거 환경, 사후 연락 가능 여부</li>
                <li>⚠️ <strong>주의</strong>: 책임비를 제외한 일체의 상업적 유료 분양은 금지됩니다.</li>
              </ul>
              <p className={styles.freeAdoptionNotice}>소중한 한 생명을 평생 가족으로 보낼 수 있도록 신중하게 작성해 주세요.</p>
            </div>
          )}

          {/* 사진 첨부 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              사진 첨부{selectedCategory === 'REPORT' || selectedCategory === 'FREE_ADOPTION' ? ' (강력 권장)' : ''}
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
                style={{ display: 'none' }}
              />
              {preview ? (
                <div className={styles.previewContainer}>
                  <img src={preview} alt="미리보기" className={styles.previewImage} />
                  <button type="button" className={styles.removeBtn} onClick={removeImage}>✕</button>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <span className={styles.uploadIcon}>
                    {selectedCategory === 'REPORT' ? '🚨' : selectedCategory === 'FREE_ADOPTION' ? '🎁' : '📸'}
                  </span>
                  <p><strong>클릭</strong>하여 사진을 선택하거나<br />여기로 <strong>드래그 앤 드롭</strong> 하세요</p>
                  {selectedCategory === 'REPORT' && (
                    <p style={{ fontSize: '0.85rem', marginTop: '8px', color: 'var(--danger-color)' }}>
                      현장 사진을 첨부하면 빠른 구조에 도움이 됩니다
                    </p>
                  )}
                  {selectedCategory === 'FREE_ADOPTION' && (
                    <p style={{ fontSize: '0.85rem', marginTop: '8px', color: '#2d6a4f' }}>
                      아이의 매력이 돋보이는 선명한 사진을 올려주세요
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 내용 */}
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
            disabled={isSubmitting}
          >
            {isSubmitting
              ? '등록 중...'
              : selectedCategory === 'REPORT'
              ? '🚨 제보 등록하기'
              : selectedCategory === 'FREE_ADOPTION'
              ? '🎁 무료 분양 등록하기'
              : '💌 후기 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdoptionReview;
