import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/HomePage.module.css";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import { fetchAnimalList } from "../api/animal";

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
  const [recentAnimals, setRecentAnimals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const navigate = useNavigate();

  const closeLoginModal = () => setIsLoginOpen(false);
  const handleLoginSuccess = () => closeLoginModal();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAnimalList(0, 4);
        if (res.isSuccess && res.result) {
          setRecentAnimals(res.result.content || []);
        }
      } catch (error) {
        console.error("Failed to load recent animals:", error);
      }
    };
    loadData();
  }, []);

  const goToSlide = (index) => setCurrent(index);

  return (
    <div className={styles.homeContainer}>
      {/* 1. Hero Section */}
      <section className={styles.heroSection}>
        <div className={`${styles.heroContent} animate-slide-up`}>
          <span className={styles.heroBadge}>사지 마세요, 입양하세요</span>
          <h1>당신의 평생 친구를<br/>만나보세요</h1>
          <p>
            새로운 가족을 기다리는 수많은 유기동물들이 있습니다.<br/>
            따뜻한 손길로 아이들의 세상을 바꿔주세요.
          </p>
          <div className={styles.heroActions}>
            <Link to="/animals" className="btn-primary">
              입양 기다리는 아이들 보기
            </Link>
            {!isAuthenticated && (
              <button onClick={() => setIsLoginOpen(true)} className="btn-secondary">
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


      {/* 2. New Arrivals Section */}
      <section className={styles.newArrivalsSection}>
        <div className={`${styles.sectionHeader} animate-slide-up`}>
          <h2>방금 들어온 새로운 가족</h2>
          <p>가장 최근에 파우메이트와 함께하게 된 아이들입니다.</p>
        </div>
        <div className={styles.animalGrid}>
          {recentAnimals.map(animal => (
            <div key={animal.animalId} className={styles.animalCard} onClick={() => navigate(`/animals/${animal.animalId}`)}>
              <div className={styles.animalBadge}>NEW</div>
              <img src={animal.profileImageUrl || dog1} alt={animal.name} className={styles.animalImage} />
              <div className={styles.animalInfo}>
                <h4>{animal.name}</h4>
                <p>{animal.species} - {animal.breed}</p>
                <div className={styles.animalMeta}>
                  <span>나이: {Math.max(0, Number(animal.age) || 0)}살</span>
                  <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>자세히 보기 &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. How it works Section */}
      <section className={styles.howItWorks}>
        <div className={`${styles.sectionHeader} animate-slide-up`}>
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

      {/* 5. Testimonials Section */}
      {testimonials.length > 0 && (
        <section className={styles.testimonialsSection}>
          <div className={`${styles.sectionHeader} animate-slide-up`}>
            <h2>입양 가족들의 따뜻한 이야기</h2>
            <p>파우메이트를 통해 새로운 가족을 만난 분들의 생생한 후기입니다.</p>
          </div>
          <div className={styles.testimonialsGrid}>
            {testimonials.map(review => (
              <div key={review.id} className={styles.testimonialCard}>
                <div className={styles.quoteIcon}>"</div>
                <div className={styles.stars}>{"★".repeat(review.rating)}</div>
                <p className={styles.testimonialText}>"{review.text}"</p>
                <div className={styles.reviewer}>
                  <div className={styles.reviewerAvatar}>{review.name[0]}</div>
                  <div className={styles.reviewerInfo}>
                    <h5>{review.name}</h5>
                    <span>{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>망설이지 마세요.<br/>아이들은 당신을 기다립니다.</h2>
          <p>지금 바로 AdoptMate와 함께 새로운 가족을 맞이할 준비를 시작해보세요.</p>
          <Link to="/animals" className={styles.primaryBtnLarge}>
            동물 목록 보러가기
          </Link>
        </div>
      </section>

      {isLoginOpen && (
        <div className={styles.modalOverlay} onClick={closeLoginModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeLoginModal}>&times;</button>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
