import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/AdminLayout.module.css';


const AdminLayout = ({ children }) => {
  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <h3>관리자 메뉴</h3>
        <ul>
        
          <li><Link to="/admin/animals">동물 관리</Link></li>
          <li><Link to="/admin/users">회원 관리</Link></li>
        </ul>
      </nav>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
