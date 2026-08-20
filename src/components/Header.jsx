import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
  const isAdmin = isAuthenticated && (user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN');
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 라우트 이동 시 모바일 메뉴 자동 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 모바일 메뉴 열렸을 때 배경 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">🐾 AdoptMate</Link>
        </div>

        {/* 데스크톱 네비게이션 */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link to="/guide" className={styles.navLink}>입양 안내</Link></li>
            <li><Link to="/animals" className={styles.navLink}>동물 목록</Link></li>
            <li><Link to="/reviews" className={styles.navLink}>입양 후기</Link></li> 
            {isAuthenticated && (
              <li><Link to="/review" className={styles.navLink}>후기작성</Link></li>
            )}
            {isAdmin && (
              <>
                <li><Link to="/admin/animals" className={styles.navLink}>동물 등록</Link></li>
                <li><Link to="/admin/users" className={styles.navLink}>사용자 관리</Link></li>
                <li><Link to="/admin/adoptions" className={styles.navLink}>입양 신청 관리</Link></li>
              </>
            )}
          </ul>
        </nav>

        {/* 데스크톱 유저 액션 */}
        <div className={styles.userActions}>
          <ul className={styles.navList}>
            <li>
              <button onClick={toggleTheme} className={styles.themeToggleBtn} aria-label="Toggle theme">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </li>
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <li>
                    <Link to="/mypage" className={styles.navLink}>
                      마이페이지 {favorites.length > 0 && <span className={styles.favBadge}>{favorites.length}</span>}
                    </Link>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout} className={styles.logoutBtn}>
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className={styles.navLink}>로그인</Link></li>
                <li><Link to="/register" className="btn-primary">회원가입</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* 모바일 햄버거 버튼 */}
        <div className={styles.mobileControls}>
          <button onClick={toggleTheme} className={styles.themeToggleBtn} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button 
            className={`${styles.hamburgerBtn} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴 열기/닫기"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* 모바일 사이드 드로어 메뉴 & 배경 오버레이 */}
      {isMobileMenuOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <div className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerLogo}>🐾 AdoptMate</span>
          <button className={styles.drawerCloseBtn} onClick={() => setIsMobileMenuOpen(false)}>
            ✕
          </button>
        </div>

        <nav className={styles.drawerNav}>
          <ul className={styles.drawerList}>
            <li><Link to="/guide" className={styles.drawerLink}>📖 입양 안내</Link></li>
            <li><Link to="/animals" className={styles.drawerLink}>🐾 동물 목록</Link></li>
            <li><Link to="/reviews" className={styles.drawerLink}>💌 입양 후기</Link></li>
            {isAuthenticated && (
              <li><Link to="/review" className={styles.drawerLink}>✏️ 후기작성</Link></li>
            )}
            
            {isAdmin && (
              <div className={styles.adminSection}>
                <span className={styles.drawerSectionTitle}>관리자 메뉴</span>
                <li><Link to="/admin/animals" className={styles.drawerLink}>🐶 동물 등록</Link></li>
                <li><Link to="/admin/users" className={styles.drawerLink}>👥 사용자 관리</Link></li>
                <li><Link to="/admin/adoptions" className={styles.drawerLink}>📋 입양 신청 관리</Link></li>
              </div>
            )}
          </ul>
        </nav>

        <div className={styles.drawerFooter}>
          {isAuthenticated ? (
            <div className={styles.drawerUserBox}>
              {!isAdmin && (
                <Link to="/mypage" className={styles.drawerMypageBtn}>
                  👤 마이페이지 {favorites.length > 0 && `(❤️ ${favorites.length})`}
                </Link>
              )}
              <button onClick={handleLogout} className={styles.drawerLogoutBtn}>
                로그아웃
              </button>
            </div>
          ) : (
            <div className={styles.drawerAuthBox}>
              <Link to="/login" className={styles.drawerLoginBtn}>로그인</Link>
              <Link to="/register" className="btn-primary" style={{textAlign: 'center', width: '100%'}}>회원가입</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
