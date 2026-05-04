// ============================================================
// ComentarioService — Criação de comentários em tarefas
// Apenas POST /comentarios (o backend só expõe criação).
// ============================================================

import api from './api';
import type { IComentario, CriarComentarioDTO } from '@/types';

const ComentarioService = {
  /** POST /comentarios — Cria um comentário vinculado a uma tarefa */
  criar: async (payload: CriarComentarioDTO): Promise<IComentario> => {
    const { data } = await api.post<IComentario>('/comentarios', payload);
    return data;
  },
};

export default ComentarioService;
