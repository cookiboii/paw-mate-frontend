import React, { useState } from 'react';
import styles from '../styles/ReportLostAnimal.module.css';

const ReportLostAnimal = () => {
  const [form, setForm] = useState({
    species: '',
    breed: '',
    color: '',
    lostDate: '',
    location: '',
    note: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('제보 정보:', form);
    alert('잃어버린 동물 제보가 접수되었습니다!');
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>잃어버린 동물 제보</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className={styles.formGroup}>
          <label>동물 종류:</label>
          <input type="text" name="species" value={form.species} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>품종:</label>
          <input type="text" name="breed" value={form.breed} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>색상:</label>
          <input type="text" name="color" value={form.color} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>잃어버린 날짜:</label>
          <input type="date" name="lostDate" value={form.lostDate} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>잃어버린 위치:</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>특이사항:</label>
          <textarea name="note" value={form.note} onChange={handleChange} rows="3" />
        </div>

        <div className={styles.formGroup}>
          <label>이미지 업로드:</label>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
        </div>

        <button type="submit" className={styles.button}>제보하기</button>
      </form>
    </section>
  );
};

export default ReportLostAnimal;
