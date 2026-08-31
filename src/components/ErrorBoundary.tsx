import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from '../styles/ErrorBoundary.module.css';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 🛡️ 전역 에러 바운더리 컴포넌트 (React Class Component)
 * 렌더링 중 예기치 못한 에러가 발생해도 전체 화면이 튕기는 것을 방지
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.errorWrapper}>
          <div className={styles.errorCard}>
            <div className={styles.iconWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={48} color="var(--danger-color, #e63946)" />
            </div>
            <h2 className={styles.title}>일시적인 오류가 발생했습니다</h2>
            <p className={styles.description}>
              페이지를 불러오는 중 문제가 발생했습니다.<br />
              잠시 후 다시 시도해 주시거나 홈으로 이동해 주세요.
            </p>
            <div className={styles.actions}>
              <button className={styles.retryBtn} onClick={this.handleReset}>
                새로고침
              </button>
              <button className={styles.homeBtn} onClick={this.handleGoHome}>
                홈으로 가기
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
