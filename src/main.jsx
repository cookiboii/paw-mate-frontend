import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // ✅ 추가

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter> {/* ✅ BrowserRouter 대신 HashRouter */}
      <App />
    </HashRouter>
  </StrictMode>
);


