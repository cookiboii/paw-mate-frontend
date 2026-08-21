import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
            <li><NavLink to="/guide" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>입양 안내</NavLink></li>
            <li><NavLink to="/animals" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>동물 목록</NavLink></li>
            <li><NavLink to="/reviews" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>입양 후기</NavLink></li>
            {isAuthenticated && (
              <li><NavLink to="/review" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>후기작성</NavLink></li>
            )}
            {isAdmin && (
              <>
                <li><NavLink to="/admin/animals" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>동물 등록</NavLink></li>
                <li><NavLink to="/admin/users" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>사용자 관리</NavLink></li>
                <li><NavLink to="/admin/adoptions" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>입양 신청 관리</NavLink></li>
              </>
            )}
          </ul>
        </nav>

        {/* 데스크톱 유저 액션 */}
        <div className={styles.userActions}>
          <ul className={styles.navList}>
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <li>
                    <NavLink to="/mypage" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>
                      마이페이지 {favorites.length > 0 && <span className={styles.favBadge}>{favorites.length}</span>}
                    </NavLink>
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
                <li><NavLink to="/login" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>로그인</NavLink></li>
                <li><Link to="/register" className="btn-primary">회원가입</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* 모바일 햄버거 버튼 */}
        <div className={styles.mobileControls}>
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

        {/* 📌 모바일 상단 사용자 프로필 / 로그인 안내 카드 */}
        <div className={styles.drawerProfileCard}>
          {isAuthenticated ? (
            <div className={styles.userCardContent}>
              <div className={styles.userCardAvatar}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className={styles.userCardInfo}>
                <span className={styles.userCardName}>{user?.name || '회원'} 님</span>
                <span className={styles.userCardRole}>
                  {isAdmin ? '👑 관리자' : '일반 회원'}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.guestCardContent}>
              <p>로그인하고 더 많은 기능을 이용해보세요!</p>
              <div className={styles.guestBtnGroup}>
                <Link to="/login" className={styles.guestLoginBtn}>로그인</Link>
                <Link to="/register" className={styles.guestRegisterBtn}>회원가입</Link>
              </div>
            </div>
          )}
        </div>

        <nav className={styles.drawerNav}>
          <ul className={styles.drawerList}>
            <li><NavLink to="/guide" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`}>📖 입양 안내</NavLink></li>
            <li><NavLink to="/animals" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`}>🐾 동물 목록</NavLink></li>
            <li><NavLink to="/reviews" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`}>💌 입양 후기</NavLink></li>
            {isAuthenticated && (
              <li><NavLink to="/review" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`}>✏️ 후기작성</NavLink></li>
            )}
            
            {isAuthenticated && !isAdmin && (
              <li>
                <NavLink to="/mypage" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`}>
                  👤 마이페이지 {favorites.length > 0 && <span className={styles.drawerFavBadge}>❤️ {favorites.length}</span>}
                </NavLink>
              </li>
            )}

            {isAdmin && (
              <div className={styles.adminSection}>
                <span className={styles.drawerSectionTitle}>관리자 전용 메뉴</span>
                <li><NavLink to="/admin/animals" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`}>🐶 동물 등록</NavLink></li>
                <li><NavLink to="/admin/users" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`}>👥 사용자 관리</NavLink></li>
                <li><NavLink to="/admin/adoptions" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`}>📋 입양 신청 관리</NavLink></li>
              </div>
            )}
          </ul>
        </nav>

        {isAuthenticated && (
          <div className={styles.drawerFooter}>
            <button onClick={handleLogout} className={styles.drawerLogoutBtn}>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
