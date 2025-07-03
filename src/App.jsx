import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import AnimalDetail from './pages/AnimalDetail';
import Admin from './pages/Admin';
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<MyPage />} />
          <Route path="/animals/:id" element={<AnimalDetail />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/adoption-review" element={<AdoptionReview />} />
          <Route path="/report-lost-animal" element={<ReportLostAnimal />} /> */}
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
