import React, { useState } from 'react';
import styles from '../styles/HomePage.module.css';
import dog from '../assets/dog.jpg';
import Login from './Login'; // 로그인 컴포넌트 import

const HomePage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLoginModal = () => setIsLoginOpen(true);
  const closeLoginModal = () => setIsLoginOpen(false);

  return (
    <div className={styles.home}>
      <div className={styles.heroSection}>
        <h1>KindTail: 유기동물에게 따뜻한 집을</h1>
        <p>입양으로 사랑을, 제보로 희망을.</p>

        <img src={dog} alt="KindTail 입양 캠페인" className={styles.dog} />

        <div className={styles.homeButtons}>
          {/* 로그인 버튼 클릭 시 모달 열기 */}
          <button className={`${styles.homeBtn} ${styles.login}`} onClick={openLoginModal}>
            로그인
          </button>
          <button className={`${styles.homeBtn} ${styles.adopt}`} onClick={() => window.location.href='/animals/1'}>
            입양하러 가기
          </button>
        </div>
      </div>

      {/* 로그인 모달 */}
      {isLoginOpen && (
        <div className={styles.modalOverlay} onClick={closeLoginModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeLoginModal}>×</button>
            <Login />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
