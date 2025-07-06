import React, { useState } from 'react';
import { registerAnimal } from '../../api/animal';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import styles from '../../styles/AdminAnimalsPage.module.css';

const STATUS_OPTIONS = [
  { key: 'WAITING', label: '입양대기' },
  { key: 'PROTECTED', label: '보호중' },
  { key: 'ADOPTED', label: '입양완료' },
];

const GENDER_OPTIONS = [
  { key: 'MALE', label: '수컷' },
  { key: 'FEMALE', label: '암컷' },
];

const AdminAnimalsPage = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role?.toUpperCase() !== 'ADMIN') return <Navigate to="/" replace />;

  const [animal, setAnimal] = useState({
    species: '',
    breed: '',
    color: '',
    status: '',
    gender: '',
    age: 0,
    image: '',
  });

  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnimal({ ...animal, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAnimal((prev) => ({ ...prev, image: reader.result }));
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await registerAnimal(animal, token);
      setMessage('✅ 동물 등록 성공');
      setAnimal({
        species: '',
        breed: '',
        color: '',
        status: '',
        gender: '',
        age: 0,
        image: '',
      });
      setPreview(null);
    } catch (err) {
      setMessage('❌ 등록 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>동물 등록 (관리자 전용)</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="species"
          value={animal.species}
          onChange={handleChange}
          placeholder="종 (예: 개, 고양이)"
          required
          className={styles.input}
        />
        <input
          name="breed"
          value={animal.breed}
          onChange={handleChange}
          placeholder="품종 (예: 푸들)"
          required
          className={styles.input}
        />
        <input
          name="color"
          value={animal.color}
          onChange={handleChange}
          placeholder="색상 (예: 흰색)"
          required
          className={styles.input}
        />

        <select
          name="status"
          value={animal.status}
          onChange={handleChange}
          required
          className={styles.input}
        >
          <option value="">상태 선택</option>
          {STATUS_OPTIONS.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          name="gender"
          value={animal.gender}
          onChange={handleChange}
          required
          className={styles.input}
        >
          <option value="">성별 선택</option>
          {GENDER_OPTIONS.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <input
          name="age"
          type="number"
          value={animal.age}
          onChange={handleChange}
          placeholder="나이 (숫자)"
          required
          className={styles.input}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={styles.input}
        />
        {preview && (
          <div className={styles.preview}>
            <img src={preview} alt="미리보기" width="150" />
          </div>
        )}

        <button type="submit" className={styles.button}>
          등록하기
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default AdminAnimalsPage;
