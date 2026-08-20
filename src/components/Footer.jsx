import { Link } from 'react-router-dom';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandColumn}>
            <h3>🐾 AdoptMate</h3>
            <p>유기동물 입양은 생명을 살리는 일입니다.<br />따뜻한 가족이 되어주세요.</p>
            <div className={styles.socialIcons}>
              <a href="https://github.com/cookiboii" target="_blank" rel="noopener noreferrer" className={styles.icon}>GitHub</a>
              <a href="https://lolesports-devboi.tistory.com/category" target="_blank" rel="noopener noreferrer" className={styles.icon}>Blog</a>
            </div>
          </div>
          
          <div className={styles.linksColumn}>
            <h4>서비스</h4>
            <ul>
              <li><Link to="/guide">입양 안내</Link></li>
              <li><Link to="/animals">동물 목록</Link></li>
              <li><Link to="/reviews">입양 후기</Link></li>
            </ul>
          </div>
          
          <div className={styles.linksColumn}>
            <h4>고객지원</h4>
            <ul>
              <li><a href="#">자주 묻는 질문</a></li>
              <li><a href="#">공지사항</a></li>
              <li><a href="#">1:1 문의</a></li>
              <li><a href="#">이용약관</a></li>
            </ul>
          </div>
          
          <div className={styles.newsletterColumn}>
            <h4>뉴스레터 구독</h4>
            <p>매월 파우메이트의 새로운 소식을 받아보세요.</p>
            <div className={styles.subscribeForm}>
              <input type="email" placeholder="이메일 주소" className={styles.subscribeInput} />
              <button className={styles.subscribeBtn}>구독</button>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.copyright}>
            &copy; {new Date().getFullYear()} Paw Mate. All rights reserved.
          </div>
          <div className={styles.legalLinks}>
            <a href="#">개인정보처리방침</a>
            <span className={styles.separator}>|</span>
            <a href="#">이용약관</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
