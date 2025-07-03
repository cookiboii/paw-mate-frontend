// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">AdoptMate</div>
      <nav className="nav">
        <Link to="/">홈</Link>
        <Link to="/animals">유기동물</Link>
        <Link to="/mypage">마이페이지</Link>
        <Link to="/admin">관리자</Link>
        <Link to="/login">로그인</Link>
      </nav>
    </header>
  );
};

export default Header;
