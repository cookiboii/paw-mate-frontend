import React, { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from '../../styles/AdminLayout.module.css';
import { LayoutDashboard, PawPrint, Users, ClipboardList, KeyRound } from 'lucide-react';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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
              to="/admin/dashboard"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LayoutDashboard size={16} />
              <span>대시보드 개요</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/animals"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <PawPrint size={16} />
              <span>동물 관리 & 등록</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Users size={16} />
              <span>사용자 관리</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/adoptions"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ClipboardList size={16} />
              <span>입양 신청 관리</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/password"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <KeyRound size={16} />
              <span>비밀번호 변경</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/benchmark"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}
            >
              <span style={{ fontSize: '1rem' }}>⚡</span>
              <span>성능/동시성 랩</span>
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
