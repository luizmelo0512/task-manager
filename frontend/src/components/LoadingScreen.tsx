// ============================================================
// LoadingScreen — Fallback visual para React.lazy/Suspense.
// Exibe um CircularProgress centralizado com efeito de fade-in.
// ============================================================

import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress
        size={48}
        sx={{
          color: 'primary.main',
          // Animação de pulso sutil
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 },
          },
        }}
      />
      <Typography variant="body2" color="text.secondary">
        Carregando...
      </Typography>
    </Box>
  );
}
