import React from 'react';
import { Link } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      {/* 사이드바 */}
      <nav style={{ width: '200px', padding: '1rem', background: '#eee', height: '100vh' }}>
        <h3>관리자 메뉴</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li><Link to="/admin">대시보드</Link></li>
          <li><Link to="/admin/animals">동물 관리</Link></li>
          <li><Link to="/admin/users">회원 관리</Link></li>
          <li><Link to="/admin/reports">제보 확인</Link></li>
        </ul>
      </nav>

      {/* 메인 콘텐츠 */}
      <main style={{ flexGrow: 1, padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
