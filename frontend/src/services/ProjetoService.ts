// ============================================================
// ProjetoService — CRUD de Projetos consumindo api.ts
// Métodos: listar, obterPorId, criar, atualizar, excluir, obterResumo
// ============================================================

import api from './api';
import type { IProjeto, IResumo, CriarProjetoDTO } from '@/types';

const ProjetoService = {
  /** GET /projetos — Lista todos os projetos */
  listar: async (): Promise<IProjeto[]> => {
    const { data } = await api.get<IProjeto[]>('/projetos');
    return data;
  },

  /** GET /projetos/{id} — Obtém projeto com tarefas eager-loaded */
  obterPorId: async (id: number): Promise<IProjeto> => {
    const { data } = await api.get<IProjeto>(`/projetos/${id}`);
    return data;
  },

  /** POST /projetos — Cria um novo projeto */
  criar: async (payload: CriarProjetoDTO): Promise<IProjeto> => {
    const { data } = await api.post<IProjeto>('/projetos', payload);
    return data;
  },

  /** PUT /projetos/{id} — Atualiza um projeto existente */
  atualizar: async (id: number, payload: CriarProjetoDTO): Promise<IProjeto> => {
    const { data } = await api.put<IProjeto>(`/projetos/${id}`, payload);
    return data;
  },

  /** DELETE /projetos/{id} — Exclui um projeto */
  excluir: async (id: number): Promise<void> => {
    await api.delete(`/projetos/${id}`);
  },

  /** GET /projetos/{id}/resumo — Resumo de tarefas agrupado por status */
  obterResumo: async (id: number): Promise<IResumo[]> => {
    const { data } = await api.get<IResumo[]>(`/projetos/${id}/resumo`);
    return data;
  },
};

export default ProjetoService;
