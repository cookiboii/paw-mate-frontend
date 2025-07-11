import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import styles from '../styles/AdoptionReview.module.css';
import { useAuth } from '../context/AuthContext';

const AdoptionReviewEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    title: '',
    content: '',
    imageBase64: ''
  });
  const [preview, setPreview] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      try {
        const userRes = await axios.get('/adoptmate/myInfo');
        const reviewRes = await axios.get(`/post/${id}`);
        const review = reviewRes.data.result;

        // 작성자 확인
        if (userRes.data.email !== review.email) {
          alert('작성자만 수정할 수 있습니다.');
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
        alert('리뷰 정보를 불러오는 데 실패했습니다.');
        navigate('/reviews');
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file) {
        const base64 = await toBase64(file);
        setForm((prev) => ({ ...prev, imageBase64: base64 }));
        setPreview(base64);
      } else {
        setForm((prev) => ({ ...prev, imageBase64: '' }));
        setPreview(null);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      alert('수정이 완료되었습니다.');
      navigate(`/reviews/${id}`);
    } catch (error) {
      console.error('❌ 수정 실패:', error);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isLoaded) return <div>로딩 중...</div>;

  return (
    <section className={styles.container}>
      <h2>입양 후기 수정</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="title"
          placeholder="제목"
          value={form.title}
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
        {preview && (
          <img
            src={preview}
            alt="미리보기"
            style={{ maxWidth: '300px', marginTop: '10px' }}
          />
        )}
        <button type="submit">수정 완료</button>
      </form>
    </section>
  );
};

export default AdoptionReviewEdit;
