export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export type ProjetoStatus = 'ativo' | 'inativo';
export type TarefaStatus = 'pendente' | 'em_andamento' | 'concluida';
export type TarefaPrioridade = 'baixa' | 'media' | 'alta';

export interface IProjeto {
  id: number;
  nome: string;
  descricao: string;
  status: ProjetoStatus;
  data_criacao: string;
  created_at?: string;
  updated_at?: string;
  tarefas?: ITarefa[];
}

export interface ITarefa {
  id: number;
  projeto_id: number;
  titulo: string;
  descricao: string;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  responsavel: string;
  data_limite: string;
  atrasada?: boolean;
  created_at?: string;
  updated_at?: string;
  comentarios?: IComentario[];
}

export interface IComentario {
  id: number;
  tarefa_id: number;
  autor: string;
  texto: string;
  data_criacao: string;
  created_at?: string;
  updated_at?: string;
}

export interface IResumo {
  status: TarefaStatus;
  total: number;
}

export interface IAtualizarStatusResponse {
  tarefa: ITarefa;
  sugerir_inativacao: boolean;
}

export interface CriarProjetoDTO {
  nome: string;
  descricao: string;
  status?: ProjetoStatus;
}

export interface CriarTarefaDTO {
  projeto_id: number;
  titulo: string;
  descricao: string;
  prioridade: TarefaPrioridade;
  responsavel: string;
  data_limite: string;
}

export interface CriarComentarioDTO {
  tarefa_id: number;
  autor: string;
  texto: string;
}
