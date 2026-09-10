import React, { useState, useRef, ChangeEvent, FormEvent, DragEvent, MouseEvent } from 'react';
import { Camera, X } from 'lucide-react';
import styles from '../../../styles/admin/AdminAnimalsPage.module.css';
import FloatingInput from '../../FloatingInput';
import { AnimalRegisterForm } from '../../../types/animal';
import { SPECIES_OPTIONS, STATUS_OPTIONS, GENDER_OPTIONS } from '../../../constants/animal';
import { uploadImageToBlob } from '../../../utils/imageUpload';
import { registerAnimal } from '../../../api/animal';
import { useToast } from '../../../context/ToastContext';
import { getErrorMessage } from '../../../utils/error';

interface AdminAnimalRegisterTabProps {
  onSuccess: () => void;
}

export const AdminAnimalRegisterTab: React.FC<AdminAnimalRegisterTabProps> = ({ onSuccess }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [animalForm, setAnimalForm] = useState<AnimalRegisterForm>({
    species: 'DOG',
    breed: '',
    color: '',
    status: 'PROTECTED',
    gender: 'MALE',
    age: '',
    image: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'age') {
      if (value === '') {
        setAnimalForm((prev) => ({ ...prev, age: '' }));
      } else {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setAnimalForm((prev) => ({ ...prev, age: parsed }));
        }
      }
      return;
    }
    setAnimalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (file: File | undefined) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
    }
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
    setAnimalForm((prev) => ({ ...prev, image: '' }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const ageNum = typeof animalForm.age === 'number' ? animalForm.age : parseInt(String(animalForm.age), 10);
    if (isNaN(ageNum) || ageNum < 0) {
      showToast('나이는 0 이상의 숫자로 입력해주세요.', 'error');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let uploadedImageUrl = animalForm.image;
      if (selectedFile) {
        uploadedImageUrl = await uploadImageToBlob(selectedFile);
      }

      await registerAnimal({ ...animalForm, image: uploadedImageUrl, age: ageNum });
      showToast('동물이 성공적으로 등록되었습니다!', 'success');

      // 폼 초기화
      setAnimalForm({
        species: 'DOG',
        breed: '',
        color: '',
        status: 'PROTECTED',
        gender: 'MALE',
        age: '',
        image: '',
      });
      setSelectedFile(null);
      setPreview(null);
      onSuccess();
    } catch (err) {
      console.error('동물 등록 실패:', err);
      showToast(getErrorMessage(err, '동물 등록에 실패했습니다.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formCenterWrapper}>
      <div className={styles.formCard}>
        <form onSubmit={handleRegisterSubmit} className={styles.formContent}>
          <div className={styles.formLayout}>
            {/* 텍스트 입력 영역 */}
            <div className={styles.inputSection}>
              <div className={styles.selectGroup}>
                <label className={styles.selectLabel}>축종</label>
                <select
                  name="species"
                  value={animalForm.species}
                  onChange={handleFormChange}
                  className={styles.select}
                  required
                >
                  {SPECIES_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <FloatingInput
                label="품종 (예: 골든 리트리버, 코리안 숏헤어)"
                type="text"
                name="breed"
                value={animalForm.breed}
                onChange={handleFormChange}
                required
              />

              <div className={styles.gridRow}>
                <FloatingInput
                  label="색상 (예: 크림색, 검정)"
                  type="text"
                  name="color"
                  value={animalForm.color}
                  onChange={handleFormChange}
                  required
                />

                <FloatingInput
                  label="나이 (살)"
                  type="number"
                  name="age"
                  value={animalForm.age}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className={styles.gridRow}>
                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>성별</label>
                  <select
                    name="gender"
                    value={animalForm.gender}
                    onChange={handleFormChange}
                    className={styles.select}
                    required
                  >
                    <option value="" disabled>성별 선택</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>보호 상태</label>
                  <select
                    name="status"
                    value={animalForm.status}
                    onChange={handleFormChange}
                    className={styles.select}
                    required
                  >
                    <option value="" disabled>상태 선택</option>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 이미지 업로드 영역 */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>동물 대표 사진</label>
              <div
                className={`${styles.uploadBox} ${preview ? styles.hasPreview : ''} ${
                  isDragging ? styles.dragging : ''
                }`}
                onClick={() => !preview && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className={styles.hiddenFileInput}
                />

                {preview ? (
                  <div className={styles.previewContainer}>
                    <img src={preview} alt="미리보기" className={styles.previewImage} />
                    <button type="button" className={styles.removeBtn} onClick={removeImage} title="사진 제거">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <div className={styles.uploadIcon}>
                      <Camera size={36} />
                    </div>
                    <p>
                      클릭하여 사진을 선택하거나<br />
                      여기로 이미지를 드래그하세요
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formFooter}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '등록 처리 중...' : '신규 동물 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAnimalRegisterTab;
