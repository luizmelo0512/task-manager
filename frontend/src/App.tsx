import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import LoadingScreen from '@/components/LoadingScreen';

const Projetos = lazy(() => import('@/pages/Projetos'));
const CadastroProjeto = lazy(() => import('@/pages/CadastroProjeto'));
const DetalheProjeto = lazy(() => import('@/pages/DetalheProjeto'));
const CadastroTarefa = lazy(() => import('@/pages/CadastroTarefa'));
const DetalheTarefa = lazy(() => import('@/pages/DetalheTarefa'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/projetos" replace />} />

            <Route path="/projetos" element={<Projetos />} />
            <Route path="/projetos/cadastro" element={<CadastroProjeto />} />
            <Route path="/projetos/:id/editar" element={<CadastroProjeto />} />
            <Route path="/projetos/:id" element={<DetalheProjeto />} />

            <Route path="/projetos/:id/tarefas/cadastro" element={<CadastroTarefa />} />
            <Route path="/tarefas/:tarefaId" element={<DetalheTarefa />} />
            <Route path="/tarefas/:tarefaId/editar" element={<CadastroTarefa />} />
          </Route>

          <Route path="*" element={<Navigate to="/projetos" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
