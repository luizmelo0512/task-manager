// ============================================================
// App.tsx — Roteamento com React.lazy e Suspense (lazy loading).
// React.lazy divide o bundle por página — cada página é carregada
// sob demanda apenas quando o usuário navega até ela.
// Suspense exibe o LoadingScreen enquanto o chunk carrega.
// ============================================================

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import LoadingScreen from '@/components/LoadingScreen';

// React.lazy: importa cada página como chunk separado (code-splitting)
const Projetos = lazy(() => import('@/pages/Projetos'));
const CadastroProjeto = lazy(() => import('@/pages/CadastroProjeto'));
const DetalheProjeto = lazy(() => import('@/pages/DetalheProjeto'));
const CadastroTarefa = lazy(() => import('@/pages/CadastroTarefa'));
const DetalheTarefa = lazy(() => import('@/pages/DetalheTarefa'));

export default function App() {
  return (
    <BrowserRouter>
      {/* Suspense envolve todas as rotas lazy — mostra fallback enquanto carrega */}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Layout é o shell principal (AppBar + Sidebar + Outlet) */}
          <Route element={<Layout />}>
            {/* Redirect da raiz para /projetos */}
            <Route path="/" element={<Navigate to="/projetos" replace />} />

            {/* Projetos */}
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/projetos/cadastro" element={<CadastroProjeto />} />
            <Route path="/projetos/:id/editar" element={<CadastroProjeto />} />
            <Route path="/projetos/:id" element={<DetalheProjeto />} />

            {/* Tarefas */}
            <Route path="/projetos/:id/tarefas/cadastro" element={<CadastroTarefa />} />
            <Route path="/tarefas/:tarefaId" element={<DetalheTarefa />} />
            <Route path="/tarefas/:tarefaId/editar" element={<CadastroTarefa />} />
          </Route>

          {/* Fallback: qualquer rota não encontrada */}
          <Route path="*" element={<Navigate to="/projetos" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
