import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, ShieldCheck } from 'lucide-react';
import styles from '../../styles/components/HomeHero.module.css';
import dog1 from '../../assets/optimized/dog1.avif';
import dog2 from '../../assets/optimized/dog2.avif';
import dog3 from '../../assets/optimized/dog3.avif';
import dog4 from '../../assets/optimized/dog4.avif';
import cat from '../../assets/optimized/cat.avif';

const images = [dog1, dog2, dog3, dog4, cat];

export default function HomeHero() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const visibleSlideIndexes = useMemo(
    () => new Set([current, (current + 1) % images.length]),
    [current],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered && !isAutoplayPaused && !prefersReducedMotion) {
        setCurrent((previous) => (previous + 1) % images.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, isAutoplayPaused, prefersReducedMotion]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  const previousSlide = () =>
    setCurrent((previous) => (previous - 1 + images.length) % images.length);
  const nextSlide = () => setCurrent((previous) => (previous + 1) % images.length);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previousSlide();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
    }
  };

  return (
    <section className={styles.heroSection}>
      <div className={`${styles.heroContent} animate-slide-up`}>
        <span className={styles.heroBadge}>
          <ShieldCheck size={14} />
          생명 존중과 책임 있는 입양의 시작
        </span>
        <h1>
          한 생명의 평생을 함께할
          <br />
          가족을 기다립니다
        </h1>
        <p>
          AdoptMate는 안락사 위기의 유기동물들이 안전하고 따뜻한 가정에서 새로운 삶을 시작할 수
          있도록 철저한 건강 검진과 투명한 절차를 거쳐 평생 가족을 연결합니다.
        </p>
        <div className={styles.heroActions}>
          <Link to="/animals" className={`btn-primary ${styles.heroPrimaryBtn}`}>
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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsHovered(false);
          }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="입양 동물 슬라이더"
        >
          {images.map(
            (image, index) =>
              visibleSlideIndexes.has(index) && (
                <img
                  key={index}
                  src={image}
                  alt={`입양 동물 슬라이드 ${index + 1} / ${images.length}`}
                  className={`${styles.slide} ${index === current ? styles.active : ''}`}
                  loading={index === current ? 'eager' : 'lazy'}
                  fetchPriority={index === current ? 'high' : 'low'}
                  decoding="async"
                />
              ),
          )}
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
            onClick={previousSlide}
            aria-label="이전 슬라이드"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
            onClick={nextSlide}
            aria-label="다음 슬라이드"
          >
            <ChevronRight size={22} />
          </button>
          <div className={styles.dots} role="tablist" aria-label="슬라이드 네비게이션">
            {images.map((_, index) => (
              <button
                type="button"
                key={index}
                role="tab"
                aria-selected={index === current}
                aria-label={`슬라이드 ${index + 1}번으로 이동`}
                className={`${styles.dot} ${index === current ? styles.activeDot : ''}`}
                onClick={() => setCurrent(index)}
              />
            ))}
            <button
              type="button"
              className={styles.autoplayToggle}
              onClick={() => setIsAutoplayPaused((paused) => !paused)}
              aria-label={
                isAutoplayPaused || prefersReducedMotion
                  ? '슬라이드 자동 재생'
                  : '슬라이드 자동 재생 일시정지'
              }
              aria-pressed={isAutoplayPaused || prefersReducedMotion}
            >
              {isAutoplayPaused || prefersReducedMotion ? <Play size={13} /> : <Pause size={13} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
