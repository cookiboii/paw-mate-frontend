import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // 로그인 안했으면 로그인 페이지로 이동
    return <Navigate to="/login" replace />;
  }

  if (user?.role?.toUpperCase() !== 'ADMIN' && user?.role?.toUpperCase() !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;  // 권한 있으면 정상 렌더링
};

export default AdminRoute;
