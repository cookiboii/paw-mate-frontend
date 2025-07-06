import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminAnimalsPage from './pages/admin/AdminAnimalsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AnimalStatusEditPage from './pages/admin/AnimalStatusEditPage'; // ✅ 추가

import AnimalDetail from './pages/AnimalDetail';
import AnimalListPage from './pages/AnimalList';
import AdoptionReview from './pages/AdoptionReview';
import MyPage from './pages/MyPage';

import AdminRoute from './components/AdminRoute';

import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 유기동물 상세 및 목록 */}
            <Route path="/animals" element={<AnimalListPage />} />
            <Route path="/animals/:id" element={<AnimalDetail />} />

            <Route path="/review" element={<AdoptionReview />} />
            <Route path="/mypage" element={<MyPage />} />

            {/* /admin 기본 경로 → /admin/animals로 리다이렉트 */}
            <Route path="/admin" element={<Navigate to="/admin/animals" replace />} />

            {/* 관리자 전용 라우트 */}
            <Route
              path="/animals/register"
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
              path="/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
