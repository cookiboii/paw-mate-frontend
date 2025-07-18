import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import AdminAnimalsPage from './pages/admin/AdminAnimalsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AnimalStatusEditPage from './pages/admin/AnimalStatusEditPage';
import AdminAdoptionsPage from './pages/admin/AdminAdoptionsPage';

import AdoptionReviewListPage from './pages/AdoptionReviewListPage';
import AnimalDetail from './pages/AnimalDetail';
import AnimalListPage from './pages/AnimalList';
import AdoptionReview from './pages/AdoptionReview';
import MyPage from './pages/MyPage';
import AdoptionForm from './pages/AdoptionForm';
import AdoptionReviewDetail from './pages/AdoptionReviewDetail';
import AdoptionReviewEdit from './pages/AdoptionReviewEdit';

import AdminRoute from './components/AdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Routes, Route, Navigate } from 'react-router-dom';

// 👇 사용자 및 관리자 라우트 구성
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 일반 사용자용 라우트 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/animals" element={<AnimalListPage />} />
      <Route path="/animals/:id" element={<AnimalDetail />} />
      <Route path="/review" element={<AdoptionReview />} />
      <Route path="/adopt/:animalId" element={<AdoptionForm />} />
      <Route path="/reviews" element={<AdoptionReviewListPage />} />
      <Route path="/reviews/:id" element={<AdoptionReviewDetail />} />
      <Route path="/reviews/:id/edit" element={<AdoptionReviewEdit />} />

      {/* 마이페이지: ADMIN이면 관리 페이지로 이동 */}
      <Route
        path="/mypage"
        element={user?.role === 'ADMIN' ? <Navigate to="/admin/users" replace /> : <MyPage />}
      />

      {/* 관리자 라우트 */}
      <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
      <Route
        path="/admin/animals"
        element={
          <AdminRoute>
            <AdminAnimalsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/animals/register"
        element={
          <AdminRoute>
            <AdminAnimalsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/animals/edit/:id"
        element={
          <AdminRoute>
            <AnimalStatusEditPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/adoptions"
        element={
          <AdminRoute>
            <AdminAdoptionsPage />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

// 👇 최상위 App 컴포넌트 (절대 Router를 여기서 쓰면 안됨!)
const App = () => {
  return (
    <AuthProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AuthProvider>
  );
};

export default App;
