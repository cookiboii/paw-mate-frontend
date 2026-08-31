import React, { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from '../../styles/AdminLayout.module.css';
import { PlusCircle, Users, ClipboardList, KeyRound } from 'lucide-react';

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
              to="/admin/animals"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <PlusCircle size={16} />
              <span>동물 등록</span>
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
        </ul>
      </nav>

      <main className={styles.mainContent}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
