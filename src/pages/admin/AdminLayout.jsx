import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from '../../styles/AdminLayout.module.css';

const AdminLayout = ({ children }) => {
  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.adminBadge}>ADMIN PANEL</span>
          <h3>관리자 센터</h3>
        </div>
        <ul className={styles.navList}>
          <li>
            <NavLink
              to="/admin/animals"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
            >
              🐾 동물 등록
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
            >
              👥 사용자 관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/adoptions"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
            >
              📋 입양 신청 관리
            </NavLink>
          </li>
        </ul>
      </nav>

      <main className={styles.mainContent}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
