import React, { useState, useEffect } from 'react';
import styles from '../styles/MyPage.module.css';
import axios from '../api/axiosInstance';
import AdminUsersPage from './admin/AdminUsersPage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [form, setForm] = useState({
    passwd: '',
    new_passwd: '',
    new_passwd_confirm: ''
  });
  const [adoptionList, setAdoptionList] = useState([]);
  const token = localStorage.getItem('token');
  const provider = localStorage.getItem('provider'); // 여기서 provider 확인
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (!token) return;

    axios.get(`http://localhost:8000/adoptmate/myInfo`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const { name, email, role } = res.data;
      setUserInfo({ name, email, role });
    })
    .catch(() => {
      alert('사용자 정보를 불러오지 못했습니다.');
    });

    axios.get('http://localhost:8000/adoptions/myAdoption', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setAdoptionList(res.data.result);
    })
    .catch(() => {
      alert('입양 내역을 불러오지 못했습니다.');
    });
  }, []);

  const handleDeleteAccount = () => {
    if (window.confirm('정말 탈퇴하시겠습니까?')) {
      axios.delete('http://localhost:8000/adoptmate/delete', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        alert('회원 탈퇴가 완료되었습니다.');
        logout();
        navigate('/');
      })
      .catch(() => {
        alert('회원 탈퇴에 실패했습니다.');
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (form.new_passwd !== form.new_passwd_confirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    axios.post('http://localhost:8000/adoptmate/password', {
      currentPassword: form.passwd,
      newPassword: form.new_passwd
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('비밀번호가 변경되었습니다. 다시 로그인 해주세요.');
      logout();
      navigate('/');
    })
    .catch(() => {
      alert('비밀번호 변경에 실패했습니다.');
    });
  };

  if (!userInfo) return <div>로딩 중...</div>;
  if (userInfo.role === 'ADMIN') return <AdminUsersPage />;

  return (
    <section className={styles.myPage}>
      <h2>마이페이지</h2>

      <div className={styles.userInfo}>
        <h3>회원 정보</h3>
        <p><strong>이름:</strong> {userInfo.name}</p>
        <p><strong>이메일:</strong> {userInfo.email}</p>
      </div>

      {provider !== 'KAKAO' && (
        <form className={styles.passwordForm} onSubmit={handleChangePassword}>
          <h3>비밀번호 변경</h3>
          <p>
            <strong>현재 비밀번호:</strong>
            <input
              type="password"
              name="passwd"
              value={form.passwd}
              onChange={handleChange}
              required
            />
          </p>
          <p>
            <strong>새 비밀번호:</strong>
            <input
              type="password"
              name="new_passwd"
              value={form.new_passwd}
              onChange={handleChange}
              required
            />
            <span className={styles.info}>영문, 숫자, 특수문자 포함 8자 이상</span>
          </p>
          <p>
            <strong>새 비밀번호 확인:</strong>
            <input
              type="password"
              name="new_passwd_confirm"
              value={form.new_passwd_confirm}
              onChange={handleChange}
              required
            />
          </p>
          <button type="submit" className={styles.updateButton}>비밀번호 변경</button>
        </form>
      )}

      <button className={styles.deleteButton} onClick={handleDeleteAccount}>
        회원 탈퇴
      </button>

      <div className={styles.adoptionSection}>
        <h3>입양 신청 내역</h3>
        {adoptionList.length === 0 ? (
          <p>입양 신청 내역이 없습니다.</p>
        ) : (
          <ul className={styles.adoptionList}>
            {adoptionList.map((adoption, index) => (
              <li key={index} className={styles.adoptionItem}>
                <img
                  src={adoption.animalImage || '/default-animal.jpg'}
                  alt={adoption.animalName}
                />
                <div>
                  <p><strong>신청일:</strong> {adoption.applyDate}</p>
                  <p><strong>상태:</strong> {adoption.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default MyPage;
