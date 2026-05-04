// ============================================================
// JWTContext — Provedor de autenticação mockado.
// Usa Context API para compartilhar o token Bearer com toda a app.
// O token é armazenado no localStorage para que o interceptor do
// Axios (api.ts) possa acessá-lo sem dependência de React.
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// Token mockado conforme especificação
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

/**
 * Hook customizado para acessar o contexto JWT.
 * Uso: const { token, isAuthenticated, logout } = useAuth();
 */
export const useAuth = () => useContext(JWTContext);

export function JWTProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(MOCK_TOKEN);

  // Ao montar, seta o token mockado no localStorage
  // para que o interceptor do Axios possa acessá-lo
  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
    }
  }, [token]);

  // Escuta o evento 'auth:unauthorized' disparado pelo interceptor
  // do Axios quando o backend retorna 401
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      localStorage.removeItem('jwt_token');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // useCallback para evitar re-renders desnecessários nos consumers
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
