import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminAnimalsPage from './pages/admin/AdminAnimalsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AnimalStatusEditPage from './pages/admin/AnimalStatusEditPage';
import AdminAdoptionsPage from './pages/admin/AdminAdoptionsPage'; // 👈 추가
import AdoptionReviewListPage from './pages/AdoptionReviewListPage'; //

import AnimalDetail from './pages/AnimalDetail';
import AnimalListPage from './pages/AnimalList';
import AdoptionReview from './pages/AdoptionReview';
import MyPage from './pages/MyPage';
import AdoptionForm from './pages/AdoptionForm'; // ✅ 입양 신청 폼
import AdoptionReviewDetail from './pages/AdoptionReviewDetail';
import AdoptionReviewEdit from './pages/AdoptionReviewEdit';

import AdminRoute from './components/AdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import ForgotPassword from "./pages/ForgotPassword";
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes >
      {/* 일반 사용자 라우트 */}
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

      <Route
        path="/mypage"
        element={
          user?.role === 'ADMIN' ? <Navigate to="/admin/users" replace /> : <MyPage />
        }
      />

      {/* 관리자 기본 경로 리디렉션 */}
      <Route path="/admin" element={<Navigate to="/admin/users" replace />} />

      {/* 관리자 전용 라우트 */}
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

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
