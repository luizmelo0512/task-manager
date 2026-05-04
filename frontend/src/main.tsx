import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import { JWTProvider } from '@/contexts/JWTContext';
import { ConfigProvider } from '@/contexts/ConfigContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JWTProvider>
      <ConfigProvider>
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
