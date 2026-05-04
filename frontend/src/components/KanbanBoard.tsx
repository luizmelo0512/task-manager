// ============================================================
// KanbanBoard — Drag & Drop para gerenciar status de tarefas.
// Usa @hello-pangea/dnd (fork do react-beautiful-dnd).
// useMemo agrupa as tarefas por status para evitar recálculos.
// Ao dropar, chama PATCH /tarefas/{id}/status via TarefaService.
// ============================================================

import { useMemo, useCallback } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FlagIcon from '@mui/icons-material/Flag';
import { useSnackbar } from 'notistack';
import TarefaService from '@/services/TarefaService';
import type { ITarefa, TarefaStatus } from '@/types';

interface KanbanBoardProps {
  tarefas: ITarefa[];
  onStatusChanged: () => void; // callback para revalidar dados via SWR
  onTarefaClick?: (tarefa: ITarefa) => void;
}

// Configuração das colunas do Kanban
const COLUMNS: { id: TarefaStatus; label: string; color: string; gradient: string }[] = [
  {
    id: 'pendente',
    label: 'Pendente',
    color: '#FFB020',
    gradient: 'linear-gradient(135deg, rgba(255,176,32,0.12) 0%, rgba(255,176,32,0.04) 100%)',
  },
  {
    id: 'em_andamento',
    label: 'Em Andamento',
    color: '#6C63FF',
    gradient: 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(108,99,255,0.04) 100%)',
  },
  {
    id: 'concluida',
    label: 'Concluída',
    color: '#00D9A5',
    gradient: 'linear-gradient(135deg, rgba(0,217,165,0.12) 0%, rgba(0,217,165,0.04) 100%)',
  },
];

// Cores de prioridade para o ícone de flag
const PRIORIDADE_COLORS: Record<string, string> = {
  baixa: '#00D9A5',
  media: '#FFB020',
  alta: '#FF4C6A',
};

export default function KanbanBoard({ tarefas, onStatusChanged, onTarefaClick }: KanbanBoardProps) {
  const { enqueueSnackbar } = useSnackbar();

  // useMemo para agrupar tarefas por status — evita recálculo a cada render
  const grouped = useMemo(() => {
    const map: Record<TarefaStatus, ITarefa[]> = {
      pendente: [],
      em_andamento: [],
      concluida: [],
    };
    tarefas.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tarefas]);

  // useCallback para estabilizar o handler do drag-end
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // Drop fora de uma zona válida ou na mesma posição
      if (!destination || destination.droppableId === source.droppableId) return;

      const tarefaId = parseInt(draggableId, 10);
      const novoStatus = destination.droppableId as TarefaStatus;

      try {
        const response = await TarefaService.atualizarStatus(tarefaId, novoStatus);
        enqueueSnackbar(`Status atualizado para "${novoStatus.replace('_', ' ')}"`, {
          variant: 'success',
        });

        // Se todas as tarefas estão concluídas, sugere inativar o projeto
        if (response.sugerir_inativacao) {
          enqueueSnackbar(
            '🎉 Todas as tarefas concluídas! Considere inativar o projeto.',
            { variant: 'info', autoHideDuration: 6000 }
          );
        }

        onStatusChanged(); // Revalida dados via SWR mutate
      } catch {
        enqueueSnackbar('Erro ao atualizar status da tarefa.', { variant: 'error' });
      }
    },
    [onStatusChanged, enqueueSnackbar]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          minHeight: 400,
        }}
      >
        {COLUMNS.map((col) => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided, snapshot) => (
              <Paper
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: col.gradient,
                  border: snapshot.isDraggingOver
                    ? `2px dashed ${col.color}`
                    : '2px solid transparent',
                  transition: 'border 0.2s ease',
                  minHeight: 300,
                }}
              >
                {/* Cabeçalho da coluna */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: col.color,
                    }}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {col.label}
                  </Typography>
                  <Chip
                    label={grouped[col.id].length}
                    size="small"
                    sx={{
                      ml: 'auto',
                      fontWeight: 700,
                      bgcolor: `${col.color}22`,
                      color: col.color,
                    }}
                  />
                </Box>

                {/* Cards das tarefas */}
                <Stack spacing={1.5}>
                  {grouped[col.id].map((tarefa, index) => (
                    <Draggable
                      key={tarefa.id}
                      draggableId={String(tarefa.id)}
                      index={index}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <Paper
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => onTarefaClick?.(tarefa)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: 'background.paper',
                            border: tarefa.atrasada
                              ? '1px solid rgba(255, 76, 106, 0.5)'
                              : '1px solid',
                            borderColor: tarefa.atrasada ? 'error.main' : 'divider',
                            boxShadow: dragSnapshot.isDragging
                              ? '0 12px 28px rgba(0,0,0,0.25)'
                              : 'none',
                            transform: dragSnapshot.isDragging ? 'rotate(3deg)' : 'none',
                            transition: 'box-shadow 0.2s, transform 0.2s',
                            '&:hover': {
                              borderColor: col.color,
                            },
                          }}
                        >
                          {/* Indicador de tarefa atrasada */}
                          {tarefa.atrasada && (
                            <Chip
                              icon={<WarningAmberIcon />}
                              label="ATRASADA"
                              color="error"
                              size="small"
                              sx={{ mb: 1, fontWeight: 700, fontSize: '0.65rem' }}
                            />
                          )}

                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                            {tarefa.titulo}
                          </Typography>

                          {tarefa.descricao && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mt: 0.5,
                              }}
                            >
                              {tarefa.descricao}
                            </Typography>
                          )}

                          {/* Footer: prioridade + responsável + data */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mt: 1.5,
                              flexWrap: 'wrap',
                            }}
                          >
                            <FlagIcon
                              sx={{
                                fontSize: 16,
                                color: PRIORIDADE_COLORS[tarefa.prioridade] || '#999',
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {tarefa.prioridade}
                            </Typography>

                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(tarefa.data_limite).toLocaleDateString('pt-BR')}
                              </Typography>
                            </Box>
                          </Box>

                          {tarefa.responsavel && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Avatar
                                sx={{
                                  width: 20,
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: 'primary.main',
                                }}
                              >
                                {tarefa.responsavel.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="caption" color="text.secondary">
                                {tarefa.responsavel}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Stack>
              </Paper>
            )}
          </Droppable>
        ))}
      </Box>
    </DragDropContext>
  );
}
