// ============================================================
// TarefaService — CRUD de Tarefas + atualização de status
// A rota especial PATCH /tarefas/{id}/status é usada pelo Kanban DnD.
// ============================================================

import api from './api';
import type { ITarefa, CriarTarefaDTO, IAtualizarStatusResponse, TarefaStatus } from '@/types';

const TarefaService = {
  /** GET /projetos/{projetoId}/tarefas — Lista tarefas de um projeto */
  listarPorProjeto: async (projetoId: number): Promise<ITarefa[]> => {
    const { data } = await api.get<ITarefa[]>(`/projetos/${projetoId}/tarefas`);
    return data;
  },

  /** GET /tarefas/{id} — Obtém tarefa com comentários eager-loaded */
  obterPorId: async (id: number): Promise<ITarefa> => {
    const { data } = await api.get<ITarefa>(`/tarefas/${id}`);
    return data;
  },

  /** POST /tarefas — Cria uma nova tarefa */
  criar: async (payload: CriarTarefaDTO): Promise<ITarefa> => {
    const { data } = await api.post<ITarefa>('/tarefas', payload);
    return data;
  },

  /** PUT /tarefas/{id} — Atualiza uma tarefa existente */
  atualizar: async (id: number, payload: Partial<CriarTarefaDTO>): Promise<ITarefa> => {
    const { data } = await api.put<ITarefa>(`/tarefas/${id}`, payload);
    return data;
  },

  /** DELETE /tarefas/{id} — Exclui uma tarefa */
  excluir: async (id: number): Promise<void> => {
    await api.delete(`/tarefas/${id}`);
  },

  /**
   * PATCH /tarefas/{id}/status — Atualiza apenas o status.
   * Retorna a tarefa atualizada + flag sugerir_inativacao
   * (quando todas as tarefas de um projeto estão concluídas).
   */
  atualizarStatus: async (id: number, status: TarefaStatus): Promise<IAtualizarStatusResponse> => {
    const { data } = await api.patch<IAtualizarStatusResponse>(`/tarefas/${id}/status`, { status });
    return data;
  },
};

export default TarefaService;
