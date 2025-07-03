import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">AdoptMate</Link>
        </div>
        <nav className={styles.nav}>
          <Link to="/">홈</Link>
  
          <Link to="/mypage">마이페이지</Link>
          <Link to="/animals/1">동물 상세</Link>
          <Link to="/admin">관리자</Link>
          <Link to="/adoption-review">입양후기</Link>
          <Link to="/report-lost-animal">제보</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
