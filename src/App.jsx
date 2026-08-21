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
import KakaoCallback from './pages/KakaoCallback';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import ToastContainer from './components/ToastContainer';
import ThemeToggleFloating from './components/ThemeToggleFloating';
import NotFound from './pages/NotFound';
import AdoptionGuide from './pages/AdoptionGuide';
import FAQ from './pages/FAQ';
import TermsOfService from './pages/TermsOfService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';

import { Routes, Route, Navigate } from 'react-router-dom';

// 👇 사용자 및 관리자 라우트 구성
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 일반 사용자용 라우트 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/guide" element={<AdoptionGuide />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/adoptmate/kakao" element={<KakaoCallback />} />
      <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
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
        element={(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN') ? <Navigate to="/admin/users" replace /> : <MyPage />}
      />

      {/* 🔐 관리자 라우트 (AdminLayout 공통 사이드바 중첩 라우트) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="animals" element={<AdminAnimalsPage />} />
        <Route path="animals/register" element={<AdminAnimalsPage />} />
        <Route path="adoptions" element={<AdminAdoptionsPage />} />
      </Route>

      {/* 레거시 동물 상태 수정 라우트 */}
      <Route
        path="/animals/edit/:id"
        element={
          <AdminRoute>
            <AnimalStatusEditPage />
          </AdminRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// 👇 최상위 App 컴포넌트 (절대 Router를 여기서 쓰면 안됨!)
const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <Layout>
              <ToastContainer />
              <ThemeToggleFloating />
              <AppRoutes />
            </Layout>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
