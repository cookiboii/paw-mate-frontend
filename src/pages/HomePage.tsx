import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, ArrowRight, HeartHandshake } from "lucide-react";
import styles from "../styles/HomePage.module.css";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import { fetchAnimalList } from "../api/animal";
import EmptyState from '../components/EmptyState';
import AnimalCard from '../components/AnimalCard';
import useScrollReveal from "../hooks/useScrollReveal";
import usePageTitle from "../hooks/usePageTitle";
import { Animal } from "../types/animal";
import { PageResponse } from "../types/common";

import dog1 from "../assets/dog1.jpg";
import dog2 from "../assets/dog2.jpg";
import dog3 from "../assets/dog3.jpg";
import dog4 from "../assets/dog4.jpg";
import cat from "../assets/cat.jpg";

const images = [dog1, dog2, dog3, dog4, cat];

const HomePage: React.FC = () => {
  usePageTitle('사지 말고 입양하세요 | AdoptMate');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const [current, setCurrent] = useState<number>(0);
  const [recentAnimals, setRecentAnimals] = useState<Animal[]>([]);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Scroll Reveal Refs
  const newArrivalsRef = useScrollReveal<HTMLDivElement>();
  const howItWorksRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  const closeLoginModal = () => setIsLoginOpen(false);
  const handleLoginSuccess = () => closeLoginModal();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrent((prev) => (prev + 1) % images.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingAnimals(true);
      try {
        const res = await fetchAnimalList(0, 4);
        const pageData: PageResponse<Animal> =
          'result' in res && res.result ? (res.result as PageResponse<Animal>) : (res as PageResponse<Animal>);
        setRecentAnimals(pageData.content || []);
      } catch (error) {
        console.error("Failed to load recent animals:", error);
      } finally {
        setIsLoadingAnimals(false);
      }
    };
    loadData();
  }, []);


  const goToSlide = (index: number) => setCurrent(index);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);

  return (
    <div className={styles.homeContainer}>
      {/* 1. Hero Section */}
      <section className={styles.heroSection}>
        <div className={`${styles.heroContent} animate-slide-up`}>
          <span className={styles.heroBadge}>사지 마세요, 입양하세요</span>
          <h1>당신의 평생 친구를<br />만나보세요</h1>
          <p>
            새로운 가족을 기다리는 수많은 유기동물들이 있습니다.<br />
            따뜻한 손길로 아이들의 세상을 바꿔주세요.
          </p>
          <div className={styles.heroActions}>
            <Link to="/animals" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>입양 기다리는 아이들 보기</span>
              <ArrowRight size={18} />
            </Link>
            {!isAuthenticated && (
              <button onClick={() => setIsLoginOpen(true)} className="btn-secondary">
                로그인 / 회원가입
              </button>
            )}
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div
            className={styles.slider}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            role="region"
            aria-label="입양 동물 슬라이더"
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`입양 동물 슬라이드 ${idx + 1} / ${images.length}`}
                className={`${styles.slide} ${idx === current ? styles.active : ""}`}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))}
            {/* 화살표 네비게이션 */}
            <button
              className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              aria-label="이전 슬라이드"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              aria-label="다음 슬라이드"
            >
              <ChevronRight size={24} />
            </button>
            <div className={styles.dots} role="tablist" aria-label="슬라이드 네비게이션">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  role="tab"
                  aria-selected={idx === current}
                  aria-label={`슬라이드 ${idx + 1}번으로 이동`}
                  className={`${styles.dot} ${idx === current ? styles.activeDot : ""}`}
                  onClick={() => goToSlide(idx)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && goToSlide(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. New Arrivals Section */}
      <section className={styles.newArrivalsSection} ref={newArrivalsRef}>
        <div className={styles.sectionHeader}>
          <h2>방금 들어온 새로운 가족</h2>
          <p>가장 최근에 파우메이트와 함께하게 된 아이들입니다.</p>
        </div>
        <div className={styles.animalGrid}>
          {isLoadingAnimals ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className={styles.animalCardSkeleton}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonLine} style={{ width: '60%' }} />
                  <div className={styles.skeletonLine} style={{ width: '40%', height: '14px' }} />
                </div>
              </div>
            ))
          ) : recentAnimals.length === 0 ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <EmptyState
                title="아직 등록된 동물이 없습니다."
                description="새로운 가족을 기다리는 아이들이 곧 등록될 예정입니다."
                actionLabel="동물 목록 둘러보기"
                actionPath="/animals"
              />
            </div>
          ) : (
            recentAnimals.map((animal) => (
              <AnimalCard
                key={animal.id || animal.animalId}
                animal={animal}
                extraBadgeText="NEW"
                showStatus
              />
            ))
          )}
        </div>
      </section>


      {/* 3. How it works Section */}
      <section className={styles.howItWorks} ref={howItWorksRef}>
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
            <h4>신청서 심사</h4>
            <p>제출해주신 입양 신청서를 바탕으로 담당자가 꼼꼼하게 검토합니다.</p>
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
      <section className={styles.ctaSection} ref={ctaRef}>
        <div className={styles.ctaContent}>
          <h2>망설이지 마세요.<br />아이들은 당신을 기다립니다.</h2>
          <p>지금 바로 AdoptMate와 함께 새로운 가족을 맞이할 준비를 시작해보세요.</p>
          <Link to="/animals" className={styles.primaryBtnLarge} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <HeartHandshake size={20} />
            <span>동물 목록 보러가기</span>
          </Link>
        </div>
      </section>

      {isLoginOpen && (
        <div className={styles.modalOverlay} onClick={closeLoginModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeLoginModal} aria-label="닫기">
              <X size={20} />
            </button>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
