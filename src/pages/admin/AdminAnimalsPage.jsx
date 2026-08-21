import React, { useState, useRef } from 'react';
import { registerAnimal } from '../../api/animal';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import styles from '../../styles/AdminAnimalsPage.module.css';
import { useToast } from '../../context/ToastContext';
import FloatingInput from '../../components/FloatingInput';
import { SPECIES_OPTIONS, STATUS_OPTIONS, GENDER_OPTIONS } from '../../constants/animal';

const AdminAnimalsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role?.toUpperCase() !== 'ADMIN' && user?.role?.toUpperCase() !== 'ROLE_ADMIN') return <Navigate to="/" replace />;

  const [animal, setAnimal] = useState({
    species: '',
    breed: '',
    color: '',
    status: '',
    gender: '',
    age: '',
    image: '',
  });

  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'age') {
      if (value === '') {
        setAnimal((prev) => ({ ...prev, age: '' }));
      } else {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setAnimal((prev) => ({ ...prev, age: parsed }));
        }
      }
      return;
    }
    setAnimal((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnimal((prev) => ({ ...prev, image: reader.result }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      showToast('이미지 파일만 업로드 가능합니다.', 'error');
    }
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
    setAnimal((prev) => ({ ...prev, image: '' }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const ageNum = parseInt(animal.age, 10);
    if (isNaN(ageNum) || ageNum < 0) {
      showToast('나이는 0 이상의 숫자로 입력해주세요.', 'error');
      return;
    }

    try {
      await registerAnimal({ ...animal, age: ageNum });
      showToast('동물이 성공적으로 등록되었습니다!', 'success');
      setAnimal({
        species: '',
        breed: '',
        color: '',
        status: '',
        gender: '',
        age: '',
        image: '',
      });
      setPreview(null);
    } catch (err) {
      showToast('등록 실패: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>🐾 유기동물 신규 등록</h2>
          <p>파우메이트에 새로운 동물을 등록하여 가족을 찾아주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContent}>
          <div className={styles.formLayout}>
            {/* 좌측: 정보 입력 폼 */}
            <div className={styles.inputSection}>
              <div className={styles.gridRow}>
                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>종 (Species)</label>
                  <select
                    name="species"
                    value={animal.species}
                    onChange={handleChange}
                    required
                    className={styles.select}
                  >
                    <option value="" disabled>선택하세요</option>
                    {SPECIES_OPTIONS.map(({ key, label }) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <FloatingInput
                  label="품종 (예: 골든 리트리버, 코숏)"
                  name="breed"
                  value={animal.breed}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.gridRow}>
                <FloatingInput
                  label="색상 (예: 흰색)"
                  name="color"
                  value={animal.color}
                  onChange={handleChange}
                  required
                />
                <FloatingInput
                  label="나이 (추정나이)"
                  name="age"
                  type="number"
                  min="0"
                  step="1"
                  value={animal.age}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
              </div>

              <div className={styles.gridRow}>
                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>성별</label>
                  <select
                    name="gender"
                    value={animal.gender}
                    onChange={handleChange}
                    required
                    className={styles.select}
                  >
                    <option value="" disabled>선택하세요</option>
                    {GENDER_OPTIONS.map(({ key, label }) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>상태</label>
                  <select
                    name="status"
                    value={animal.status}
                    onChange={handleChange}
                    required
                    className={styles.select}
                  >
                    <option value="" disabled>선택하세요</option>
                    {STATUS_OPTIONS.map(({ key, label }) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 우측: 사진 업로드 */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>동물 프로필 사진</label>
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
                    <span className={styles.uploadIcon}>📷</span>
                    <p>사진 <strong>클릭</strong> 또는<br/><strong>드래그 앤 드롭</strong></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formFooter}>
            <button type="submit" className="btn-primary">
              동물 등록 완료하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAnimalsPage;
