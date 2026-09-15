import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isUserLoading } = useAuth();

  // 저장된 세션으로 진입한 직후에는 /myInfo 응답 전까지 역할을 확정할 수 없다.
  if (isAuthenticated && isUserLoading) {
    return (
      <div className="page-loader" role="status" aria-label="권한 확인 중">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // 로그인 안했으면 로그인 페이지로 이동
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>; // 권한 있으면 정상 렌더링
};

export default AdminRoute;
