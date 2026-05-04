// ============================================================
// Tipagens do Sistema de Gerenciamento de Tarefas
// Refletem os Models do backend Laravel (Projeto, Tarefa, Comentario)
// ============================================================

/**
 * Interface genérica para respostas da API.
 * Encapsula o dado retornado e metadados opcionais de paginação.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ----- Enums de Domínio -----

export type ProjetoStatus = 'ativo' | 'inativo';

export type TarefaStatus = 'pendente' | 'em_andamento' | 'concluida';

export type TarefaPrioridade = 'baixa' | 'media' | 'alta';

// ----- Interfaces Principais -----

/**
 * IProjeto — Espelha a tabela `projetos` no banco.
 * O campo `tarefas` é eager-loaded apenas no GET /projetos/{id}.
 */
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

/**
 * ITarefa — Espelha a tabela `tarefas` no banco.
 * O campo `atrasada` é calculado pelo backend (prioridade alta + data_limite passada + não concluída).
 * O campo `comentarios` é eager-loaded apenas no GET /tarefas/{id}.
 */
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

/**
 * IComentario — Espelha a tabela `comentarios` no banco.
 */
export interface IComentario {
  id: number;
  tarefa_id: number;
  autor: string;
  texto: string;
  data_criacao: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * IResumo — Resposta do endpoint GET /projetos/{id}/resumo.
 * Agrupa a contagem de tarefas por status.
 */
export interface IResumo {
  status: TarefaStatus;
  total: number;
}

/**
 * Resposta do PATCH /tarefas/{id}/status
 */
export interface IAtualizarStatusResponse {
  tarefa: ITarefa;
  sugerir_inativacao: boolean;
}

// ----- DTOs (Data Transfer Objects para criação/edição) -----

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
