import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <h1>AdoptMate에 오신 것을 환영합니다 🐶🐱</h1>
        <p>유기동물에게 새로운 가족을 찾아주는 입양 플랫폼입니다.</p>
        <div className="home-buttons">
          <Link to="/login" className="home-btn login">로그인</Link>
          <Link to="/animals/1" className="home-btn adopt">입양하러 가기</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
