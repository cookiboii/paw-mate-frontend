import React, { useState } from 'react';
import styles from '../styles/AdoptionReview.module.css';

const AdoptionReview = () => {
  const [form, setForm] = useState({ author: '', content: '', image: null });
  const [reviews, setReviews] = useState([]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm((prev) => ({ ...prev, image: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.author || !form.content) return alert('모든 항목을 입력해주세요');

    // 리뷰에 이미지 파일도 포함해서 저장
    setReviews((prev) => [...prev, { ...form, date: new Date().toLocaleDateString() }]);
    setForm({ author: '', content: '', image: null });
  };

  return (
    <section className={styles.container}>
      <h2>입양 후기</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="author"
          placeholder="작성자 이름"
          value={form.author}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="후기를 입력해주세요"
          value={form.content}
          onChange={handleChange}
          rows={4}
          required
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />
        {/* 선택한 이미지 미리보기 */}
        {form.image && (
          <img
            src={URL.createObjectURL(form.image)}
            alt="선택한 이미지"
            style={{ maxWidth: '300px', marginTop: '10px' }}
          />
        )}
        <button type="submit">후기 등록</button>
      </form>

      <div className={styles.reviewList}>
        {reviews.map((review, idx) => (
          <div key={idx} className={styles.review}>
            <p className={styles.meta}>
              <strong>{review.author}</strong> | {review.date}
            </p>
            <p>{review.content}</p>
            {review.image && (
              <img
                src={URL.createObjectURL(review.image)}
                alt="후기 이미지"
                className={styles.reviewImage}
                style={{ maxWidth: '300px', marginTop: '10px' }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdoptionReview;
