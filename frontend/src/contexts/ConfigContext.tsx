import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

type ThemeMode = 'dark' | 'light';

interface ConfigContextType {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ConfigContext = createContext<ConfigContextType>({
  mode: 'dark',
  toggleMode: () => {},
});

export const useConfig = () => useContext(ConfigContext);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme_mode');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme_mode', next);
      return next;
    });
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#6C63FF',
            light: '#8B83FF',
            dark: '#4A42D4',
          },
          secondary: {
            main: '#00D9A5',
            light: '#33E3B9',
            dark: '#00A87D',
          },
          ...(mode === 'dark'
            ? {
                background: {
                  default: '#0A0E1A',
                  paper: '#111827',
                },
              }
            : {
                background: {
                  default: '#F5F7FA',
                  paper: '#FFFFFF',
                },
              }),
          error: {
            main: '#FF4C6A',
          },
          warning: {
            main: '#FFB020',
          },
          success: {
            main: '#00D9A5',
          },
        },
        typography: {
          fontFamily: "'Inter', sans-serif",
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          subtitle1: { fontWeight: 500 },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 10,
                padding: '8px 20px',
                '&.MuiButton-containedPrimary': {
                  background: 'linear-gradient(135deg, #6C63FF 0%, #8B83FF 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5A52E0 0%, #7B73FF 100%)',
                  },
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                border: mode === 'dark' ? '1px solid rgba(108, 99, 255, 0.12)' : '1px solid rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'dark'
                    ? '0 8px 32px rgba(108, 99, 255, 0.15)'
                    : '0 8px 32px rgba(0,0,0,0.08)',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                fontSize: '0.75rem',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ConfigContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ConfigContext.Provider>
  );
}
