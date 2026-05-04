import api from './api';
import type { IProjeto, IResumo, CriarProjetoDTO } from '@/types';

const ProjetoService = {
  listar: async (): Promise<IProjeto[]> => {
    const { data } = await api.get<IProjeto[]>('/projetos');
    return data;
  },

  obterPorId: async (id: number): Promise<IProjeto> => {
    const { data } = await api.get<IProjeto>(`/projetos/${id}`);
    return data;
  },

  criar: async (payload: CriarProjetoDTO): Promise<IProjeto> => {
    const { data } = await api.post<IProjeto>('/projetos', payload);
    return data;
  },

  atualizar: async (id: number, payload: CriarProjetoDTO): Promise<IProjeto> => {
    const { data } = await api.put<IProjeto>(`/projetos/${id}`, payload);
    return data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/projetos/${id}`);
  },

  obterResumo: async (id: number): Promise<IResumo[]> => {
    const { data } = await api.get<IResumo[]>(`/projetos/${id}/resumo`);
    return data;
  },
};

export default ProjetoService;
