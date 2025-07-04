import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // 로그인 안했으면 로그인 페이지로 이동
    return <Navigate to="/login" replace />;
  }

  if (user?.role?.toUpperCase() !== 'ADMIN') {
    // 관리자 권한 없으면 홈으로 리다이렉트
    return <Navigate to="/" replace />;
  }

  return children;  // 권한 있으면 정상 렌더링
};

export default AdminRoute;
