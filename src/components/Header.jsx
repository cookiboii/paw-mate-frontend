import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = isAuthenticated && user?.role?.toUpperCase() === 'ADMIN';
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">🐾 AdoptMate</Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link to="/animals" className={styles.navLink}>동물 목록</Link></li>
            <li><Link to="/reviews" className={styles.navLink}>입양 후기</Link></li> 
            {isAuthenticated && (
              <li><Link to="/review" className={styles.navLink}>후기작성</Link></li>
            )}
            {isAdmin && (
              <>
                <li><Link to="/admin/users" className={styles.navLink}>사용자 관리</Link></li>
                <li><Link to="/admin/adoptions" className={styles.navLink}>입양 신청 관리</Link></li>
              </>
            )}
          </ul>
        </nav>

        <div className={styles.userActions}>
          <ul className={styles.navList}>
            {isAuthenticated ? (
              <>
                {!isAdmin && <li><Link to="/mypage" className={styles.navLink}>마이페이지</Link></li>}
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
      </div>
    </header>
  );
};

export default Header;
