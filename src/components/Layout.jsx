import Header from './Header';
import Footer from './Footer';
import styles from '../styles/Layout.module.css';  // CSS 모듈 임포트

const Layout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.mainContent}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
