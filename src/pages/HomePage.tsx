import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, ArrowRight, ShieldCheck, HeartHandshake, CheckCircle2, FileText, Home, Heart } from "lucide-react";
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
  const principlesRef = useScrollReveal<HTMLDivElement>();
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
          <span className={styles.heroBadge}>
            <ShieldCheck size={14} style={{ marginRight: '6px' }} />
            생명 존중과 책임 있는 입양의 시작
          </span>
          <h1>한 생명의 평생을 함께할<br />가족을 기다립니다</h1>
          <p>
            파우메이트는 안락사 위기의 유기동물들이 안전하고 따뜻한 가정에서 새로운 삶을 시작할 수 있도록,
            철저한 건강 검진과 투명한 심사를 거쳐 평생 가족을 연결합니다.
          </p>
          <div className={styles.heroActions}>
            <Link to="/animals" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>보호 중인 동물 확인하기</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/guide" className="btn-secondary">
              입양 절차 및 원칙
            </Link>
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
              <ChevronLeft size={22} />
            </button>
            <button
              className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              aria-label="다음 슬라이드"
            >
              <ChevronRight size={22} />
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
          <span className={styles.sectionSubTitle}>NEW ARRIVALS</span>
          <h2>가족을 기다리는 아이들</h2>
          <p>구조 후 건강 검진과 돌봄을 받으며 따뜻한 평생 반려인을 기다리고 있습니다.</p>
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
                title="현재 대기 중인 동물이 없습니다."
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
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/animals" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>보호 중인 아이들 모두 보기</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 4. 책임 있는 입양 4대 원칙 */}
      <section className={styles.principlesSection} ref={principlesRef}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubTitle}>OUR PRINCIPLES</span>
          <h2>파우메이트의 4대 안심 원칙</h2>
          <p>생명을 대하는 진중한 태도로, 아이와 가족 모두가 행복할 수 있는 환경을 만듭니다.</p>
        </div>
        <div className={styles.principlesGrid}>
          <div className={styles.principleCard}>
            <div className={styles.principleIcon}><CheckCircle2 size={24} color="var(--primary-color)" /></div>
            <h4>철저한 사전 건강 검진</h4>
            <p>기본 접종, 중성화 여부, 기저 질환을 투명하게 확인하고 진료 기록을 보호자에게 온전히 공유합니다.</p>
          </div>
          <div className={styles.principleCard}>
            <div className={styles.principleIcon}><FileText size={24} color="var(--primary-color)" /></div>
            <h4>책임감 있는 매칭 심사</h4>
            <p>주거 환경, 가족 구성원의 동의, 경제적 부양 능력을 종합적으로 고려하여 신중하게 심사합니다.</p>
          </div>
          <div className={styles.principleCard}>
            <div className={styles.principleIcon}><Home size={24} color="var(--primary-color)" /></div>
            <h4>직접 방문 및 교감</h4>
            <p>온라인 신청 후 보호소에서 아이와 직접 대면하여 서로의 기질과 환경이 맞는지 교감 시간을 갖습니다.</p>
          </div>
          <div className={styles.principleCard}>
            <div className={styles.principleIcon}><Heart size={24} color="var(--primary-color)" /></div>
            <h4>평생 지속되는 사후 케어</h4>
            <p>입양 후에도 커뮤니티와 상담 창구를 통해 훈련, 건강, 돌봄에 필요한 정보를 함께 나눕니다.</p>
          </div>
        </div>
      </section>

      {/* 5. How it works Section */}
      <section className={styles.howItWorks} ref={howItWorksRef}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubTitle}>PROCESS</span>
          <h2>입양 절차 안내</h2>
          <p>신중하고 체계적인 3단계 절차로 안전하게 진행됩니다.</p>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>01</div>
            <h4>동물 확인 및 신청서 작성</h4>
            <p>온라인에서 아이들의 프로필과 건강 상태를 확인하고 정성껏 신청서를 작성합니다.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>02</div>
            <h4>신청서 심사 및 결과 안내</h4>
            <p>제출된 서류를 바탕으로 양육 환경과 적합성을 면밀히 심사하여 결과를 안내해 드립니다.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>03</div>
            <h4>보호소 방문 및 입양 확정</h4>
            <p>보호소에 방문하여 아이와 첫인사를 나누고 서약서 작성 후 평생 가족이 됩니다.</p>
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className={styles.ctaSection} ref={ctaRef}>
        <div className={styles.ctaContent}>
          <h2>사지 마세요, 입양하세요.<br />한 생명의 세상을 바꿀 수 있습니다.</h2>
          <p>당신의 따뜻한 결심이 한 아이에게는 평생의 기적이 됩니다.</p>
          <Link to="/animals" className={styles.primaryBtnLarge} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <HeartHandshake size={20} />
            <span>새로운 가족 맞이하기</span>
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
