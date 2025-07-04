import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  console.log(user);
  
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [adminMenuOpen, setAdminMenuOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  console.log('로그인 상태:', isAuthenticated);
  console.log('로그인 사용자 정보:', user);
  console.log('관리자 여부:', user?.role?.toUpperCase() === 'ADMIN');
  console.log(isAdmin);
  
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
              {/* 제보 메뉴 삭제 */}
            </>
          )}

          <Link to="/animals/1">동물 상세</Link>

          {isAuthenticated && isAdmin && (
            <div className={styles.adminSection}>
              <hr className={styles.divider} />
              <div className={styles.adminMenu}>
                <span
                  className={styles.adminLabel}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                >
                  👑 관리자 메뉴 {adminMenuOpen ? '▼' : '▶'}
                </span>
                {adminMenuOpen && (
                  <ul className={styles.adminLinks}>
                    <li><Link to="/admin">📊 대시보드</Link></li>
                    <li><Link to="/admin/animals">🐶 동물 관리</Link></li>
                    <li><Link to="/admin/users">👥 회원 관리</Link></li>
                    {/* 제보 확인 메뉴 삭제 */}
                  </ul>
                )}
              </div>
            </div>
          )}

          {!isAuthenticated ? (
            <Link to="/login">로그인</Link>
          ) : (
            <button onClick={() => setShowLogoutConfirm(true)} className={styles.logoutBtn}>
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
