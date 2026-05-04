import api from './api';
import type { ITarefa, CriarTarefaDTO, IAtualizarStatusResponse, TarefaStatus } from '@/types';

const TarefaService = {
  listarPorProjeto: async (projetoId: number): Promise<ITarefa[]> => {
    const { data } = await api.get<ITarefa[]>(`/projetos/${projetoId}/tarefas`);
    return data;
  },

  obterPorId: async (id: number): Promise<ITarefa> => {
    const { data } = await api.get<ITarefa>(`/tarefas/${id}`);
    return data;
  },

  criar: async (payload: CriarTarefaDTO): Promise<ITarefa> => {
    const { data } = await api.post<ITarefa>('/tarefas', payload);
    return data;
  },

  atualizar: async (id: number, payload: Partial<CriarTarefaDTO>): Promise<ITarefa> => {
    const { data } = await api.put<ITarefa>(`/tarefas/${id}`, payload);
    return data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/tarefas/${id}`);
  },

  atualizarStatus: async (id: number, status: TarefaStatus): Promise<IAtualizarStatusResponse> => {
    const { data } = await api.patch<IAtualizarStatusResponse>(`/tarefas/${id}/status`, { status });
    return data;
  },
};

export default TarefaService;
