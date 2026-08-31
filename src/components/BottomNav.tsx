import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PawPrint, MessageSquare, Heart, User } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import styles from '../styles/BottomNav.module.css';

const BottomNav: React.FC = () => {
  const { favorites } = useFavorites();

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

      <NavLink
        to="/mypage"
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      >
        <Heart size={20} />
        <span>관심 목록</span>
        {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
      </NavLink>

      <NavLink
        to="/mypage"
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      >
        <User size={20} />
        <span>마이</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
