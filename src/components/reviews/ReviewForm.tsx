import ReviewCategoryGuide from './ReviewCategoryGuide';
import ReviewImageInput from './ReviewImageInput';
import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styles from '../../styles/pages/AdoptionReview.module.css';
import FloatingInput from '../FloatingInput';
import { REVIEW_CATEGORY_PREFIX as CATEGORY_PREFIX } from '../../utils/reviewCategory';
import { uploadImageToBlob } from '../../utils/imageUpload';
import { getErrorMessage } from '../../utils/error';
import { useToast } from '../../context/ToastContext';
import useImageSelection from '../../hooks/useImageSelection';
import type { PostCategory, PostCreateRequestDto } from '../../types/review';
import {
  HeartHandshake,
  Gift,
  AlertTriangle,
  Camera,
  X,
  MapPin,
  Calendar,
  PawPrint,
  Phone,
  AlertCircle,
  Heart,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  {
    key: 'REVIEW',
    label: '입양 후기',
    desc: '입양 후 반려동물과의 소중한 이야기를 공유해요',
    icon: <HeartHandshake size={16} />,
    prefix: CATEGORY_PREFIX.REVIEW,
  },
  {
    key: 'FREE_ADOPTION',
    label: '무료 분양',
    desc: '새로운 가족을 찾는 아이들의 무료 분양 글을 등록해요 (상업적 분양 금지)',
    icon: <Gift size={16} />,
    prefix: CATEGORY_PREFIX.FREE_ADOPTION,
  },
  {
    key: 'REPORT',
    label: '유기동물 제보',
    desc: '유기·학대 동물을 목격했다면 알려주세요',
    icon: <AlertTriangle size={16} />,
    prefix: CATEGORY_PREFIX.REPORT,
  },
];

interface Props {
  initialValues?: { title: string; content: string; img: string };
  initialCategory: PostCategory;
  isEditing?: boolean;
  onSave: (payload: PostCreateRequestDto) => Promise<void>;
}

export default function ReviewForm({
  initialValues = { title: '', content: '', img: '' },
  initialCategory,
  isEditing = false,
  onSave,
}: Props) {
  const [form, setForm] = useState(initialValues);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const { showToast } = useToast();
  const selection = useImageSelection(initialValues.img);
  const { selectedFile, removed } = selection;
  const activeCat =
    CATEGORY_OPTIONS.find((item) => item.key === selectedCategory) || CATEGORY_OPTIONS[0];
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!form.title.trim() || !form.content.trim()) {
      showToast('제목과 내용을 모두 입력해주세요.', 'error');
      return;
    }
    const title = `${activeCat.prefix} ${form.title.trim()}`;
    if (title.length > 200) {
      showToast('게시글 제목은 분류 문구를 포함해 200자 이하로 작성해 주세요.', 'error');
      return;
    }
    if (form.content.length > 20000) {
      showToast('게시글 내용은 20,000자 이하로 작성해 주세요.', 'error');
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const img = selectedFile ? await uploadImageToBlob(selectedFile) : removed ? '' : form.img;
      await onSave({
        title,
        content: form.content,
        img,
        category: selectedCategory,
      });
    } catch (error) {
      showToast(getErrorMessage(error, '게시글 저장에 실패했습니다.'), 'error');
    } finally {
      submittingRef.current = false;
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
              disabled={isEditing || isSubmitting}
              onClick={() => setSelectedCategory(cat.key as PostCategory)}
            >
              {cat.icon}
              <span>{cat.label}</span>
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
          <h2>{isEditing ? '게시글 수정' : activeCat.label}</h2>
          <p>{isEditing ? `${activeCat.label} 내용을 수정합니다.` : activeCat.desc}</p>
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
              maxLength={Math.max(1, 199 - activeCat.prefix.length)}
            />
          </div>

          {!isEditing && <ReviewCategoryGuide selectedCategory={selectedCategory} />}

          <ReviewImageInput
            selection={selection}
            selectedCategory={selectedCategory}
            isEditing={isEditing}
          />

          {/* 내용 */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <label className={`${styles.label} ${styles.fieldHeaderLabel}`}>상세 내용 *</label>
              <span className={styles.charCount}>{form.content.length}자</span>
            </div>
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
              maxLength={20000}
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
              ? isEditing
                ? '수정 중...'
                : '등록 중...'
              : isEditing
                ? '수정 완료하기'
                : selectedCategory === 'REPORT'
                  ? '제보 등록하기'
                  : selectedCategory === 'FREE_ADOPTION'
                    ? '무료 분양 등록하기'
                    : '후기 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
