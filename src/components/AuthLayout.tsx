import type { ReactNode } from 'react';
import { PawPrint } from 'lucide-react';
import styles from '../styles/components/AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export default function AuthLayout({
  title,
  description,
  children,
  footer,
  wide = false,
}: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <section className={`${styles.card} ${wide ? styles.cardWide : ''}`}>
        <header className={styles.header}>
          <span className={styles.brandMark} aria-hidden="true">
            <PawPrint size={20} />
          </span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </header>
        <div className={styles.content}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </section>
    </main>
  );
}
