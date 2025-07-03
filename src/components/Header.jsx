import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext'; // 예시 위치

const Header = () => {
  const { isAuthenticated, user } = useAuth(); // user 객체에 role이나 isAdmin 포함 가정

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">🐾AdoptMate🐾</Link>
        </div>
        <nav className={styles.nav}>
          <Link to="/">홈</Link>

          {isAuthenticated && <Link to="/mypage">마이페이지</Link>
           &&<Link to="/adoption-review">입양후기</Link>
          && <Link to="/report-lost-animal">제보</Link>}

          <Link to="/animals/1">동물 상세</Link>

          {isAuthenticated && user?.isAdmin && (
            <Link to="/admin">관리자</Link>
          )}

         
        </nav>
      </div>
    </header>
  );
};

export default Header;
