import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PawPrint, MessageSquare, Heart, User, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import styles from '../styles/components/BottomNav.module.css';

const BottomNav: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { favorites } = useFavorites();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  const isFavoritesActive = location.pathname === '/mypage' && currentTab === 'favorites';
  const isMyPageActive = location.pathname === '/mypage' && currentTab !== 'favorites';

  return (
    <nav className={styles.bottomNav} aria-label="모바일 하단 네비게이션">
      <NavLink
        to="/"
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        end
      >
        <Home size={20} />
        <span>홈</span>
      </NavLink>

      <NavLink
        to="/animals"
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      >
        <PawPrint size={20} />
        <span>입양 동물</span>
      </NavLink>

      <NavLink
        to="/reviews"
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      >
        <MessageSquare size={20} />
        <span>커뮤니티</span>
      </NavLink>

      {isAuthenticated ? (
        <>
          {!isAdmin && (
            <NavLink
              to="/mypage?tab=favorites"
              className={() => `${styles.navItem} ${isFavoritesActive ? styles.navItemActive : ''}`}
            >
              <Heart size={20} />
              <span>관심 목록</span>
              {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
            </NavLink>
          )}

          {isAdmin ? (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <ShieldCheck size={20} />
              <span>관리자</span>
            </NavLink>
          ) : (
            <NavLink
              to="/mypage"
              className={() => `${styles.navItem} ${isMyPageActive ? styles.navItemActive : ''}`}
            >
              <User size={20} />
              <span>마이</span>
            </NavLink>
          )}
        </>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          <LogIn size={20} />
          <span>로그인</span>
        </NavLink>
      )}
    </nav>
  );
};

export default BottomNav;
