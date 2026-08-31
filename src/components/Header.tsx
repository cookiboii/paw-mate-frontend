import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PawPrint, BookOpen, MessageSquare, User, Heart, ShieldCheck, Crown, X, LogOut } from 'lucide-react';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 라우트 이동 시 모바일 메뉴 자동 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 화면 크기 변경 시 (데스크톱 복귀 시) 모바일 메뉴 자동 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 868) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <PawPrint size={22} color="var(--primary-color, #ff6b6b)" />
            <span>AdoptMate</span>
          </Link>
        </div>

        {/* 데스크톱 네비게이션 */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><NavLink to="/guide" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>입양 안내</NavLink></li>
            <li><NavLink to="/animals" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>동물 목록</NavLink></li>
            <li><NavLink to="/reviews" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}>커뮤니티</NavLink></li>
            {isAdmin && (
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => `${styles.navLink} ${styles.adminCenterLink} ${isActive ? styles.activeNavLink : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={16} color="var(--primary-color)" />
                  <span>관리자 센터</span>
                </NavLink>
              </li>
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
          <span className={styles.drawerLogo} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <PawPrint size={20} color="var(--primary-color, #ff6b6b)" />
            <span>AdoptMate</span>
          </span>
          <button className={styles.drawerCloseBtn} onClick={() => setIsMobileMenuOpen(false)} aria-label="닫기">
            <X size={20} />
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
                <span className={styles.userCardRole} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {isAdmin ? <><Crown size={14} color="#f59e0b" /> 관리자</> : '일반 회원'}
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
            <li>
              <NavLink to="/guide" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={18} /> 입양 안내
              </NavLink>
            </li>
            <li>
              <NavLink to="/animals" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PawPrint size={18} /> 동물 목록
              </NavLink>
            </li>
            <li>
              <NavLink to="/reviews" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={18} /> 커뮤니티
              </NavLink>
            </li>
            
            {isAuthenticated && !isAdmin && (
              <li>
                <NavLink to="/mypage" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={18} /> 마이페이지 {favorites.length > 0 && <span className={styles.drawerFavBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Heart size={12} fill="currentColor" /> {favorites.length}</span>}
                </NavLink>
              </li>
            )}

            {isAdmin && (
              <li>
                <NavLink to="/admin/users" className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} color="var(--primary-color)" /> 관리자 센터
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {isAuthenticated && (
          <div className={styles.drawerFooter}>
            <button onClick={handleLogout} className={styles.drawerLogoutBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <LogOut size={16} /> 로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
