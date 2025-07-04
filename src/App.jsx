import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminAnimalsPage from './pages/admin/AdminAnimalsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';      // 추가
  // 추가

import AnimalDetail from './pages/AnimalDetail';
import AdoptionReview from './pages/AdoptionReview';
import ReportLostAnimal from './pages/ReportLostAnimal';

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
            
            {/* 빈 /me 경로는 주석 처리하거나 필요시 연결하세요 */}
            {/* <Route path="/me" /> */}

            <Route path="/animals/:id" element={<AnimalDetail />} />
            <Route path="/adoption-review" element={<AdoptionReview />} />
            <Route path="/report-lost-animal" element={<ReportLostAnimal />} />

           {/* 관리자 전용 라우트는 AdminRoute로 감싸서 보호 */}
  <Route
    path="/admin/animals"
    element={
      <AdminRoute>
        <AdminAnimalsPage />
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
        
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
