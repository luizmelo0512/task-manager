// ============================================================
// main.tsx — Entry point da aplicação React.
// Envolve o App com os Providers:
// - JWTProvider: autenticação (token mockado)
// - ConfigProvider: tema MUI (dark/light) + ThemeProvider
// - SnackbarProvider: notificações visuais (notistack)
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import { JWTProvider } from '@/contexts/JWTContext';
import { ConfigProvider } from '@/contexts/ConfigContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* JWTProvider: provê token de autenticação mockado */}
    <JWTProvider>
      {/* ConfigProvider: controla dark/light mode e provê ThemeProvider MUI */}
      <ConfigProvider>
        {/* SnackbarProvider: feedback visual global (sucesso/erro) */}
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <App />
        </SnackbarProvider>
      </ConfigProvider>
    </JWTProvider>
  </StrictMode>
);
