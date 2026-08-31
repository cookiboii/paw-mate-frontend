import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.mainContent}>{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Layout;
