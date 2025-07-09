import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>
          <a href="https://github.com/cookiboii">My Github</a> |{" "}
          <a href="https://lolesports-devboi.tistory.com/category">My blog</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
