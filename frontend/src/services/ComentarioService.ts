import api from './api';
import type { IComentario, CriarComentarioDTO } from '@/types';

const ComentarioService = {
  criar: async (payload: CriarComentarioDTO): Promise<IComentario> => {
    const { data } = await api.post<IComentario>('/comentarios', payload);
    return data;
  },
};

export default ComentarioService;
