// Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">🐾AdoptMate🐾</Link>
        </div>

        <nav className={styles.nav}>
          <Link to="/">홈</Link>

          {isAuthenticated && (
            <>
              <Link to="/mypage">마이페이지</Link>
              <Link to="/adoption-review">입양후기</Link>
              <Link to="/report-lost-animal">제보</Link>
            </>
          )}

          <Link to="/animals/1">동물 상세</Link>

          {isAuthenticated && user?.isAdmin && (
            <Link to="/admin">관리자</Link>
          )}

          {!isAuthenticated ? (
            <Link to="/login">로그인</Link>
          ) : (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={styles.logoutBtn}
            >
              로그아웃
            </button>
          )}
        </nav>
      </div>

      {showLogoutConfirm && (
        <div className={styles.logoutModalOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <p>정말 로그아웃 하시겠습니까?</p>
            <div className={styles.modalButtons}>
              <button onClick={handleLogout} className={styles.confirmBtn}>확인</button>
              <button onClick={() => setShowLogoutConfirm(false)} className={styles.cancelBtn}>취소</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
