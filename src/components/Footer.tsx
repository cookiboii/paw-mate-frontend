import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Footer.module.css';

const Footer: React.FC = () => {
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
              <li><Link to="/reviews">커뮤니티</Link></li>
            </ul>
          </div>

          <div className={styles.linksColumn}>
            <h4>고객지원</h4>
            <ul>
              <li><Link to="/faq">자주 묻는 질문</Link></li>
              <li><Link to="/terms">이용약관</Link></li>
            </ul>
          </div>

          <div className={styles.linksColumn}>
            <h4>긴급 제보 & 상담</h4>
            <ul className={styles.contactList}>
              <li style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '1.05rem' }}>📞 1577-0954</li>
              <li style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>동물보호 상담센터 (평일 09:00~18:00)</li>
              <li style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>응급 구조 신고: 국번없이 120 / 112</li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.copyright}>
            &copy; {new Date().getFullYear()} AdoptMate Platform. All rights reserved.
          </div>
          <div className={styles.legalLinks}>
            <Link to="/terms">개인정보처리방침</Link>
            <span className={styles.separator}>|</span>
            <Link to="/terms">이용약관</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
