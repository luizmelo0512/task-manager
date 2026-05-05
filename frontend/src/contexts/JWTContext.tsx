import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const MOCK_TOKEN = 'PSWCLOUD-TOKEN-2026';

interface JWTContextType {
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const JWTContext = createContext<JWTContextType>({
  token: null,
  isAuthenticated: false,
  logout: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(JWTContext);

export function JWTProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(MOCK_TOKEN);

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
    }
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      localStorage.removeItem('jwt_token');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('jwt_token');
  }, []);

  return (
    <JWTContext.Provider value={{ token, isAuthenticated: !!token, logout }}>
      {children}
    </JWTContext.Provider>
  );
}
