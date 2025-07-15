import React, { useState, useEffect } from "react";
import styles from "../styles/HomePage.module.css";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

// 이미지 배열
import dog1 from "../assets/dog1.jpg";
import dog2 from "../assets/dog2.jpg";
import dog3 from "../assets/dog3.jpg";
import dog4 from "../assets/dog4.jpg";
import cat from "../assets/cat.jpg";
const images = [dog1, dog2, dog3,dog4,cat];

const HomePage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [current, setCurrent] = useState(0);

  const closeLoginModal = () => setIsLoginOpen(false);
  const handleLoginSuccess = () => closeLoginModal();

  // 자동 슬라이드 전환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000); // 3초마다 전환
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => setCurrent(index);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);

  return (
    <div className={styles.home}>
      <div className={styles.heroSection}>
        <h1>🐶 유기동물에게 따뜻한 집을🦴</h1>
        <p>😺입양으로 사랑을, 제보로 희망을.😺</p>

        <div className={styles.slider}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`슬라이드 ${idx}`}
              className={`${styles.slide} ${idx === current ? styles.active : ""}`}
            />
          ))}

          <button className={styles.prev} onClick={prevSlide}>❮</button>
          <button className={styles.next} onClick={nextSlide}>❯</button>

          <div className={styles.dots}>
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`${styles.dot} ${idx === current ? styles.activeDot : ""}`}
                onClick={() => goToSlide(idx)}
              ></span>
            ))}
          </div>
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
