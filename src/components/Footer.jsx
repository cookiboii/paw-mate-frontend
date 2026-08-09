import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3>🐾 AdoptMate</h3>
            <p>당신의 평생 친구를 만나는 곳.</p>
          </div>
          <div className={styles.socialIcons}>
            <a href="https://github.com/cookiboii" target="_blank" rel="noopener noreferrer" className={styles.icon}>GitHub</a>
            <a href="https://lolesports-devboi.tistory.com/category" target="_blank" rel="noopener noreferrer" className={styles.icon}>Blog</a>
          </div>
        </div>
        <div className={styles.bottomSection}>
          <p>&copy; {new Date().getFullYear()} AdoptMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
