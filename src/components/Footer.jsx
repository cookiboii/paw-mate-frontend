import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <h3>🐾 AdoptMate</h3>
            <p>당신의 평생 친구를 만나는 곳.<br/>버려진 동물들에게 따뜻한 가족을 찾아주세요.</p>
          </div>
          <div className={styles.links}>
            <h4>서비스</h4>
            <ul>
              <li><a href="/animals">동물 목록</a></li>
              <li><a href="/reviews">입양 후기</a></li>
              <li><a href="#">입양 안내</a></li>
            </ul>
          </div>
          <div className={styles.links}>
            <h4>고객 지원</h4>
            <ul>
              <li><a href="#">공지사항</a></li>
              <li><a href="#">자주 묻는 질문</a></li>
              <li><a href="#">문의하기</a></li>
            </ul>
          </div>
          <div className={styles.links}>
            <h4>Developer</h4>
            <ul>
              <li><a href="https://github.com/cookiboii" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://lolesports-devboi.tistory.com/category" target="_blank" rel="noopener noreferrer">Blog</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.bottomSection}>
          <p>&copy; {new Date().getFullYear()} AdoptMate. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <a href="#">이용약관</a>
            <a href="#">개인정보처리방침</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
