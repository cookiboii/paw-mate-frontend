import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = isAuthenticated && user?.role?.toUpperCase() === 'ADMIN';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">🐾 AdoptMate</Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link to="/" className={styles.navLink}>홈</Link></li>
            <li><Link to="/animals" className={styles.navLink}>동물 목록</Link></li>

            {isAuthenticated && (
              <>
                <li><Link to="/review" className={styles.navLink}>입양 후기</Link></li>
              </>
            )}

            {isAdmin && (
              <>
              
                <li><Link to="/admin/users" className={styles.navLink}>회원 관리</Link></li>
                <li><Link to="/admin/adoptions" className={styles.navLink}>입양 신청 관리</Link></li>
              </>
            )}

            {isAuthenticated ? (
              <>
                {!isAdmin && <li><Link to="/mypage" className={styles.navLink}>마이페이지</Link></li>}
                <li>
                  <button onClick={logout} className={styles.logoutBtn}>
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className={styles.navLink}>로그인</Link></li>
                <li><Link to="/register" className={styles.navLink}>회원가입</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
