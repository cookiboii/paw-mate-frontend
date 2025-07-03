import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 AdoptMate. All rights reserved.</p>
        <p>
          <a href="/privacy">개인정보 처리방침</a> | <a href="/terms">이용약관</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
