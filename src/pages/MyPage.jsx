import React, { useState, useEffect } from 'react';
import styles from '../styles/MyPage.module.css';
import axios from '../api/axiosInstance';
import AdminUsersPage from './admin/AdminUsersPage';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    axios.get(`http://localhost:8000/adoptmate/myInfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then(res => {
      const { name, email, role } = res.data; // ✅ 이 부분 수정
      setUserInfo({ name, email, role });
       console.log(res);
       
    })
    .catch(() => {
      alert('사용자 정보를 불러오지 못했습니다.');
    });
  }, []);

  const handleDeleteAccount = () => {
    if (window.confirm('정말 탈퇴하시겠습니까?')) {
      axios.delete('/members/delete', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then(() => {
        alert('회원 탈퇴가 완료되었습니다.');
        localStorage.removeItem('token');
        window.location.href = '/';
      })
      .catch(() => {
        alert('회원 탈퇴에 실패했습니다.');
      });
    }
  };

  if (!userInfo) return <div>로딩 중...</div>;
  if ( userInfo.role ==='ADMIN') {
      return <AdminUsersPage/>
  }

  return (
    <section className={styles.myPage}>
      <h2>마이페이지</h2>

      <div className={styles.userInfo}>
        <h3>회원 정보</h3>
        <p><strong>이름:</strong> {userInfo.name}</p>
        <p><strong>이메일:</strong> {userInfo.email}</p>
        <p><strong>권한:</strong> {userInfo.role}</p> {/* 권한도 출력 */}
      </div>

      <button className={styles.deleteButton} onClick={handleDeleteAccount}>
        회원 탈퇴
      </button>
    </section>
  );
};

export default MyPage;
