import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">🐾 AdoptMate</Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link to="/">홈</Link></li>
            <li><Link to="/animals">동물 목록</Link></li>

            {/* ✅ 관리자 전용 */}
            {isAdmin && (
              <li><Link to="/animals/register">동물 등록</Link></li>
            )}

            {/* ✅ 로그인 사용자만 입양 후기 접근 */}
            {isAuthenticated && (
              <li><Link to="/review">입양 후기</Link></li>
            )}

            {isAuthenticated ? (
              <>
                <li><Link to="/mypage">마이페이지</Link></li>
                <li>
                  <button onClick={logout} className={styles.logoutBtn}>
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">로그인</Link></li>
                <li><Link to="/register">회원가입</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
