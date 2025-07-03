import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ padding: '1rem', background: '#f0f0f0' }}>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/">홈</Link>
        <Link to="/login">로그인</Link>
        <Link to="/mypage">마이페이지</Link>
        <Link to="/animals/1">동물 상세</Link>
        <Link to="/admin">관리자</Link>
        <Link to="/adoption-review">입양후기</Link>
        <Link to="/report-lost-animal">제보</Link>
      </nav>
    </header>
  );
};

export default Header;
