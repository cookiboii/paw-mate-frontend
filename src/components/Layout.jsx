import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main style={{ minHeight: '80vh', padding: '20px' }}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
