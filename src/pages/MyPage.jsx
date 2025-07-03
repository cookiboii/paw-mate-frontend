import React, { useState, useEffect } from 'react';
import styles from '../styles/MyPage.module.css';


const MyPage = () => {
  // 예시 사용자 정보 상태 (실제 API 호출 후 세팅)
  const [userInfo, setUserInfo] = useState(null);
  const [adoptionList, setAdoptionList] = useState([]);

  // 예시: 컴포넌트 마운트 시 사용자 정보와 입양 내역 불러오기
  useEffect(() => {
    // TODO: API 호출해서 사용자 정보 가져오기
    setUserInfo({
      name: '홍길동',
      email: 'user@example.com',
      joinedDate: '2023-01-15',
    });

    // TODO: API 호출해서 입양 신청 내역 가져오기
    setAdoptionList([
      { id: 1, petName: '초코', date: '2023-06-20', status: '승인 대기 중' },
      { id: 2, petName: '몽실', date: '2023-05-10', status: '입양 완료' },
    ]);
  }, []);

  // 회원 탈퇴 클릭 핸들러 (예: API 호출 후 로그아웃 등 처리)
  const handleDeleteAccount = () => {
    if (window.confirm('정말 회원 탈퇴 하시겠습니까?')) {
      // TODO: API 호출로 회원 탈퇴 처리
      alert('회원 탈퇴가 완료되었습니다.');
      // TODO: 로그아웃 처리 및 페이지 이동 등
    }
  };

  if (!userInfo) return <div>로딩 중...</div>;

  return (
    <section className={styles.myPage}>
      <h2>마이페이지</h2>

      <div className={styles.userInfo}>
        <h3>회원 정보</h3>
        <p><strong>이름:</strong> {userInfo.name}</p>
        <p><strong>이메일:</strong> {userInfo.email}</p>
        <p><strong>가입일:</strong> {userInfo.joinedDate}</p>
      </div>

      <div className={styles.adoptionHistory}>
        <h3>입양 신청 내역</h3>
        {adoptionList.length === 0 ? (
          <p>신청 내역이 없습니다.</p>
        ) : (
          <table className={styles.adoptionTable}>
            <thead>
              <tr>
                <th>반려동물 이름</th>
                <th>신청 날짜</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {adoptionList.map((item) => (
                <tr key={item.id}>
                  <td>{item.petName}</td>
                  <td>{item.date}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button className={styles.deleteButton} onClick={handleDeleteAccount}>
        회원 탈퇴
      </button>
    </section>
  );
};

export default MyPage;
