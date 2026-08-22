import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/HomePage.module.css";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import { fetchAnimalList } from "../api/animal";
import axios from "../api/axiosInstance";
import { getCleanTitle } from "./AdoptionReviewListPage";
import EmptyState from '../components/EmptyState';
import useScrollReveal from "../hooks/useScrollReveal";
import usePageTitle from "../hooks/usePageTitle";

import dog1 from "../assets/dog1.jpg";
import dog2 from "../assets/dog2.jpg";
import dog3 from "../assets/dog3.jpg";
import dog4 from "../assets/dog4.jpg";
import cat from "../assets/cat.jpg";

const images = [dog1, dog2, dog3, dog4, cat];

const DEFAULT_TESTIMONIALS = [
  {
    id: "default-1",
    name: "김민지",
    role: '믹스견 "코코" 입양 가족',
    text: "처음엔 낯을 많이 가려서 걱정했는데, 지금은 세상에서 가장 애교 많은 가족이 되었어요. 파우메이트 덕분에 평생 친구를 만났습니다.",
    rating: 5,
  },
  {
    id: "default-2",
    name: "이준혁",
    role: '치즈태비 "나비" 입양 가족',
    text: "입양 절차가 투명하고 상세하게 안내되어 초보 집사도 안심하고 데려올 수 있었어요. 매일 퇴근길이 기다려집니다.",
    rating: 5,
  },
  {
    id: "default-3",
    name: "박서연",
    role: '시바믹스 "보리" 입양 가족',
    text: "사지 않고 입양하길 정말 잘했다고 매일 생각해요. 따뜻한 눈빛으로 바라보는 아이를 볼 때마다 가슴이 뭉클해집니다.",
    rating: 5,
  },
];

const HomePage = () => {
  usePageTitle('사지 말고 입양하세요 🐾');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [current, setCurrent] = useState(0);
  const [recentAnimals, setRecentAnimals] = useState([]);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(true);
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Scroll Reveal Refs
  const newArrivalsRef = useScrollReveal();
  const howItWorksRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const ctaRef = useScrollReveal();

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
        const [animalRes, postRes] = await Promise.allSettled([
          fetchAnimalList(0, 4),
          axios.get('/post/list?page=0&size=6&sort=id,desc'),
        ]);

        if (animalRes.status === 'fulfilled' && animalRes.value) {
          const list = animalRes.value?.result?.content || animalRes.value?.content || animalRes.value?.result || [];
          setRecentAnimals(Array.isArray(list) ? list : []);
        }

        if (postRes.status === 'fulfilled' && postRes.value?.data) {
          const allPosts = postRes.value.data.result?.content ?? postRes.value.data?.content ?? [];
          const reviewPosts = allPosts
            .filter((p) => !p.title?.startsWith('[유기동물제보]'))
            .slice(0, 3);

          if (reviewPosts.length > 0) {
            const mapped = reviewPosts.map((p) => ({
              id: p.id,
              postId: p.id,
              name: p.name || '입양 가족',
              role: getCleanTitle(p.title) || '입양 후기',
              text: p.content?.slice(0, 90) + (p.content?.length > 90 ? '...' : ''),
              img: p.img,
              rating: 5,
            }));
            setTestimonials(mapped);
          }
        }
      } catch (error) {
        console.error("Failed to load home page data:", error);
      } finally {
        setIsLoadingAnimals(false);
      }
    };
    loadData();
  }, []);

  const goToSlide = (index) => setCurrent(index);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);

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
              />
            ))}
            {/* 화살표 네비게이션 */}
            <button
              className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              aria-label="이전 슬라이드"
            >
              &#8249;
            </button>
            <button
              className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              aria-label="다음 슬라이드"
            >
              &#8250;
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
                icon="🐾"
                title="아직 등록된 동물이 없습니다."
                description="새로운 가족을 기다리는 아이들이 곧 등록될 예정입니다."
                actionLabel="동물 목록 둘러보기"
                actionPath="/animals"
              />
            </div>
          ) : (
            recentAnimals.map(animal => (
              <div key={animal.id || animal.animalId} className={styles.animalCard} onClick={() => navigate(`/animals/${animal.id || animal.animalId}`)}>
                <div className={styles.animalBadge}>NEW</div>
                <img src={animal.image || animal.profileImageUrl || dog1} alt={`${animal.breed || animal.species} - ${animal.species === 'DOG' ? '강아지' : animal.species === 'CAT' ? '고양이' : '기타'}`} className={styles.animalImage} />
                <div className={styles.animalInfo}>
                  <h4>{animal.breed || animal.name || animal.species}</h4>
                  <p>{animal.species === 'DOG' ? '강아지' : animal.species === 'CAT' ? '고양이' : animal.species} {animal.breed ? `- ${animal.breed}` : ''}</p>
                  <div className={styles.animalMeta}>
                    <span>나이: {Math.max(0, Number(animal.age) || 0)}살</span>
                    <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>자세히 보기 &rarr;</span>
                  </div>
                </div>
              </div>
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
        <section className={styles.testimonialsSection} ref={testimonialsRef}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>REVIEWS</span>
            <h2>입양 가족들의 따뜻한 이야기</h2>
            <p>파우메이트를 통해 새로운 가족을 만난 분들의 생생한 후기입니다.</p>
          </div>
          <div className={styles.testimonialsGrid}>
            {testimonials.map(review => (
              <div
                key={review.id}
                className={styles.testimonialCard}
                onClick={() => {
                  if (review.postId) {
                    navigate(`/reviews/${review.postId}`);
                  } else {
                    navigate('/reviews');
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(review.postId ? `/reviews/${review.postId}` : '/reviews')}
              >
                <div className={styles.quoteIcon}>"</div>
                <div className={styles.stars}>{"★".repeat(review.rating)}</div>
                <p className={styles.testimonialText}>"{review.text}"</p>
                <div className={styles.reviewer}>
                  {review.img ? (
                    <img src={review.img} alt={review.name} className={styles.reviewerAvatarImg} />
                  ) : (
                    <div className={styles.reviewerAvatar}>{review.name[0]}</div>
                  )}
                  <div className={styles.reviewerInfo}>
                    <h5>{review.name}</h5>
                    <span>{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.testimonialAction}>
            <Link to="/reviews" className="btn-secondary">
              💌 입양 후기 & 제보 더 보러가기 &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* 4. CTA Section */}
      <section className={styles.ctaSection} ref={ctaRef}>
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
