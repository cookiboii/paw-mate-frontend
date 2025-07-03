import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import AnimalDetail from './pages/AnimalDetail';
import AdoptionReview from './pages/AdoptionReview';
import ReportLostAnimal from './pages/ReportLostAnimal';
import Admin from './pages/Admin';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/me"
              element={
                <ProtectedRoute>
                  <MyPage />
                </ProtectedRoute>
              }
            />
            <Route path="/animals/:id" element={<AnimalDetail />} />
            <Route path="/adoption-review" element={<AdoptionReview />} />
            <Route path="/report-lost-animal" element={<ReportLostAnimal />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
