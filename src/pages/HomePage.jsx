import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/HomePage.module.css";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

import dog1 from "../assets/dog1.jpg";
import dog2 from "../assets/dog2.jpg";
import dog3 from "../assets/dog3.jpg";
import dog4 from "../assets/dog4.jpg";
import cat from "../assets/cat.jpg";

const images = [dog1, dog2, dog3, dog4, cat];

const HomePage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const closeLoginModal = () => setIsLoginOpen(false);
  const handleLoginSuccess = () => closeLoginModal();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => setCurrent(index);

  return (
    <div className={styles.homeContainer}>
      {/* 1. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>사지 마세요, 입양하세요</span>
          <h1>당신의 평생 친구를<br/>만나보세요</h1>
          <p>
            새로운 가족을 기다리는 수많은 유기동물들이 있습니다.<br/>
            따뜻한 손길로 아이들의 세상을 바꿔주세요.
          </p>
          <div className={styles.heroActions}>
            <Link to="/animals" className={styles.primaryBtn}>
              입양 기다리는 아이들 보기
            </Link>
            {!isAuthenticated && (
              <button onClick={() => setIsLoginOpen(true)} className={styles.secondaryBtn}>
                로그인 / 회원가입
              </button>
            )}
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.slider}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`입양 동물 ${idx + 1}`}
                className={`${styles.slide} ${idx === current ? styles.active : ""}`}
              />
            ))}
            <div className={styles.dots}>
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`${styles.dot} ${idx === current ? styles.activeDot : ""}`}
                  onClick={() => goToSlide(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statCard}>
          <h3>1,240+</h3>
          <p>새로운 가족을 만난 아이들</p>
        </div>
        <div className={styles.statCard}>
          <h3>85+</h3>
          <p>현재 가족을 기다리는 아이들</p>
        </div>
        <div className={styles.statCard}>
          <h3>98%</h3>
          <p>입양 후 만족도</p>
        </div>
      </section>

      {/* 3. How it works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2>입양은 이렇게 진행됩니다</h2>
          <p>신중한 입양을 위해 꼼꼼한 절차를 거치고 있습니다.</p>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>1</div>
            <h4>동물 확인 및 신청</h4>
            <p>온라인으로 마음에 드는 동물을 확인하고 입양 신청서를 작성합니다.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>2</div>
            <h4>전화 상담</h4>
            <p>담당자와의 상담을 통해 입양 조건 및 환경을 확인합니다.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>3</div>
            <h4>보호소 방문 및 교감</h4>
            <p>실제 보호소에 방문하여 아이와 직접 만나고 교감하는 시간을 가집니다.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>4</div>
            <h4>입양 완료</h4>
            <p>모든 절차가 완료되면 아이와 함께 따뜻한 집으로 돌아갑니다.</p>
          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>망설이지 마세요. 아이들은 당신을 기다립니다.</h2>
          <p>지금 바로 AdoptMate와 함께 새로운 가족을 맞이할 준비를 시작해보세요.</p>
          <Link to="/animals" className={styles.primaryBtnLarge}>
            동물 목록 보러가기
          </Link>
        </div>
      </section>

      {isLoginOpen && (
        <div className={styles.modalOverlay} onClick={closeLoginModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeLoginModal}>×</button>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
