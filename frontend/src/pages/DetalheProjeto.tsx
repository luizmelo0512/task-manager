// ============================================================
// DetalheProjeto — Detalhe do projeto com Kanban de tarefas.
// Usa SWR para buscar tarefas vinculadas ao projeto.
// Tarefas atrasadas (prioridade alta + data passada) são destacadas.
// ============================================================

import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  Box, Typography, Button, Paper, Chip, Skeleton, Alert, Stack, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { fetchEntity } from '@/services/api';
import KanbanBoard from '@/components/KanbanBoard';
import type { IProjeto, ITarefa } from '@/types';

export default function DetalheProjeto() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const projetoId = Number(id);

  // SWR: busca projeto com dados básicos
  const { data: projeto, error: errProjeto, isLoading: loadProjeto } = useSWR<IProjeto>(
    `/projetos/${projetoId}`, fetchEntity
  );

  // SWR: busca tarefas do projeto (com campo atrasada calculado pelo backend)
  const { data: tarefas, error: errTarefas, isLoading: loadTarefas, mutate: mutateTarefas } = useSWR<ITarefa[]>(
    `/projetos/${projetoId}/tarefas`, fetchEntity
  );

  // Callback para revalidar tarefas após drag&drop no Kanban
  const handleStatusChanged = useCallback(() => { mutateTarefas(); }, [mutateTarefas]);

  // Callback para clicar em uma tarefa no Kanban
  const handleTarefaClick = useCallback((tarefa: ITarefa) => {
    navigate(`/tarefas/${tarefa.id}`);
  }, [navigate]);

  if (errProjeto || errTarefas) {
    return <Alert severity="error" sx={{ mt: 2 }}>Erro ao carregar dados do projeto.</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projetos')} color="inherit">Voltar</Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {loadProjeto ? <Skeleton width={250} /> : projeto?.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {loadProjeto ? <Skeleton width={400} /> : projeto?.descricao}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/projetos/${projetoId}/editar`)}>
          Editar
        </Button>
      </Box>

      {/* Info do projeto */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={projeto?.status?.toUpperCase() || ''}
            sx={{
              bgcolor: projeto?.status === 'ativo' ? 'rgba(0,217,165,0.15)' : 'rgba(148,163,184,0.15)',
              color: projeto?.status === 'ativo' ? '#00D9A5' : '#94A3B8',
              fontWeight: 700,
            }}
          />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Criado em: {projeto ? new Date(projeto.data_criacao || projeto.created_at || '').toLocaleDateString('pt-BR') : ''}
            </Typography>
          </Stack>
          <Chip label={`${tarefas?.length ?? 0} tarefas`} variant="outlined" size="small" />
        </Stack>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* Kanban Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Quadro de Tarefas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/projetos/${projetoId}/tarefas/cadastro`)} id="btn-nova-tarefa">
          Nova Tarefa
        </Button>
      </Box>

      {/* Kanban Board */}
      {loadTarefas ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={300} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : tarefas && tarefas.length > 0 ? (
        <KanbanBoard tarefas={tarefas} onStatusChanged={handleStatusChanged} onTarefaClick={handleTarefaClick} />
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">Nenhuma tarefa encontrada. Crie a primeira tarefa!</Typography>
        </Paper>
      )}
    </Box>
  );
}
