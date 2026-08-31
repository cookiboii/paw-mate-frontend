import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { scan } from 'react-scan';
import App from './App';
import './styles/global.css';

// 🚀 React Scan: 리렌더링 감지 및 렌더링 성능 시각화 (개발 환경)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  scan({
    enabled: true,
    log: false,
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

