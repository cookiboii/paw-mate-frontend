import React, { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import ToastContainer from './components/ToastContainer';
import ThemeToggleFloating from './components/ThemeToggleFloating';
import ScrollToTop from './components/ScrollToTop';
import FloatingScrollTop from './components/FloatingScrollTop';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🚀 Code Splitting: Lazy loading pages for optimal performance
const HomePage = lazy(() => import('./pages/HomePage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AnimalListPage = lazy(() => import('./pages/AnimalList'));
const AnimalDetail = lazy(() => import('./pages/AnimalDetail'));
const AdoptionForm = lazy(() => import('./pages/AdoptionForm'));
const AdoptionReview = lazy(() => import('./pages/AdoptionReview'));
const AdoptionReviewListPage = lazy(() => import('./pages/AdoptionReviewListPage'));
const AdoptionReviewDetail = lazy(() => import('./pages/AdoptionReviewDetail'));
const AdoptionReviewEdit = lazy(() => import('./pages/AdoptionReviewEdit'));
const MyPage = lazy(() => import('./pages/MyPage'));
const AdoptionGuide = lazy(() => import('./pages/AdoptionGuide'));
const FAQ = lazy(() => import('./pages/FAQ'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const KakaoCallback = lazy(() => import('./pages/KakaoCallback'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminAnimalsPage = lazy(() => import('./pages/admin/AdminAnimalsPage'));
const AdminAdoptionsPage = lazy(() => import('./pages/admin/AdminAdoptionsPage'));
const AdminPasswordPage = lazy(() => import('./pages/admin/AdminPasswordPage'));
const AnimalStatusEditPage = lazy(() => import('./pages/admin/AnimalStatusEditPage'));

const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    width: '100%'
  }}>
    <Spinner />
  </div>
);

// 👇 사용자 및 관리자 라우트 구성
const AppRoutes = () => {
  const { isAdmin } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
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
          element={isAdmin ? <Navigate to="/admin/users" replace /> : <MyPage />}
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
          <Route path="password" element={<AdminPasswordPage />} />
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
    </Suspense>
  );
};

// 👇 최상위 App 컴포넌트
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <FavoritesProvider>
              <ScrollToTop />
              <Layout>
                <ToastContainer />
                <ThemeToggleFloating />
                <FloatingScrollTop />
                <AppRoutes />
              </Layout>
            </FavoritesProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
