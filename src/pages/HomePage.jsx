import React, { useState } from "react";
import styles from "../styles/HomePage.module.css";
import dog from "../assets/dog.jpg";
import Login from "./Login";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated } = useAuth(); // 로그인 여부 체크

  const openLoginModal = () => setIsLoginOpen(true);
  const closeLoginModal = () => setIsLoginOpen(false);

  const handleLoginSuccess = () => {
    closeLoginModal();
  };

  return (
    <div className={styles.home}>
      <div className={styles.heroSection}>
        <h1>🐶 유기동물에게 따뜻한 집을🦴</h1>
        <p>😺입양으로 사랑을, 제보로 희망을.😺</p>

        <img src={dog} alt="KindTail 입양 캠페인" className={styles.dog} />

        <div className={styles.homeButtons}>
       
        
        </div>
      </div>

      {isLoginOpen && (
        <div className={styles.modalOverlay} onClick={closeLoginModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeLoginModal}>
              ×
            </button>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
