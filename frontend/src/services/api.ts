// ============================================================
// api.ts — Instância Axios centralizada com interceptors
// O interceptor de request injeta o Bearer token do JWTContext.
// O interceptor de response captura 401 e emite evento global.
// ============================================================

import axios from 'axios';

// Instância com baseURL apontando para o proxy do Vite → backend Laravel
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// --- Interceptor de Request ---
// Injeta o token Bearer armazenado no localStorage (setado pelo JWTContext).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interceptor de Response ---
// Captura erros 401 (não autorizado) e emite um evento global
// que o JWTContext escuta para forçar logout.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Emite evento customizado que o JWTContext escuta
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

/**
 * fetchEntity<T> — Função genérica para GET requests.
 * Usada como fetcher pelo SWR para data fetching declarativo.
 * Encapsula o GET do Axios com tratamento de erro.
 */
export async function fetchEntity<T>(url: string): Promise<T> {
  try {
    const response = await api.get<T>(url);
    return response.data;
  } catch (error) {
    // Re-throw para que o SWR capture e exponha no hook
    throw error;
  }
}

export default api;
