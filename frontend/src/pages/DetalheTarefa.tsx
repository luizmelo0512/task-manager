// ============================================================
// DetalheTarefa — Detalhes da tarefa + seção de comentários.
// Usa SWR para buscar tarefa com comentários eager-loaded.
// ============================================================

import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  Box, Typography, Button, Paper, Chip, Skeleton, Alert, Stack, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { fetchEntity } from '@/services/api';
import ComentarioSection from '@/components/ComentarioSection';
import type { ITarefa } from '@/types';

const STATUS_LABELS: Record<string, string> = { pendente: 'Pendente', em_andamento: 'Em Andamento', concluida: 'Concluída' };
const STATUS_COLORS: Record<string, string> = { pendente: '#FFB020', em_andamento: '#6C63FF', concluida: '#00D9A5' };
const PRIO_COLORS: Record<string, string> = { baixa: '#00D9A5', media: '#FFB020', alta: '#FF4C6A' };

export default function DetalheTarefa() {
  const navigate = useNavigate();
  const { tarefaId } = useParams<{ tarefaId: string }>();

  // SWR: busca tarefa com comentários
  const { data: tarefa, error, isLoading, mutate } = useSWR<ITarefa>(
    `/tarefas/${tarefaId}`, fetchEntity
  );

  // Callback para revalidar após adicionar comentário
  const handleComentarioAdded = useCallback(() => { mutate(); }, [mutate]);

  if (error) return <Alert severity="error" sx={{ mt: 2 }}>Erro ao carregar tarefa.</Alert>;

  const isAtrasada = tarefa?.atrasada || (
    tarefa?.prioridade === 'alta' &&
    tarefa?.status !== 'concluida' &&
    new Date(tarefa?.data_limite || '') < new Date()
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} color="inherit">Voltar</Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {isLoading ? <Skeleton width={300} /> : tarefa?.titulo}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/tarefas/${tarefaId}/editar`)}>
          Editar
        </Button>
      </Box>

      {/* Alerta de tarefa atrasada */}
      {isAtrasada && (
        <Alert severity="error" icon={<WarningAmberIcon />} sx={{ mb: 2, borderRadius: 2 }}>
          Esta tarefa está <strong>atrasada</strong>! A data limite já passou e a prioridade é alta.
        </Alert>
      )}

      {/* Detalhes */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        {isLoading ? (
          <Stack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} height={30} />)}</Stack>
        ) : tarefa ? (
          <>
            <Typography variant="body1" sx={{ mb: 3 }}>{tarefa.descricao}</Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={STATUS_LABELS[tarefa.status] || tarefa.status}
                sx={{ bgcolor: `${STATUS_COLORS[tarefa.status]}22`, color: STATUS_COLORS[tarefa.status], fontWeight: 700 }}
              />
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <FlagIcon sx={{ fontSize: 18, color: PRIO_COLORS[tarefa.prioridade] }} />
                <Typography variant="body2" sx={{ color: PRIO_COLORS[tarefa.prioridade], fontWeight: 600 }}>
                  {tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{tarefa.responsavel}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: isAtrasada ? 'error.main' : 'text.secondary' }} />
                <Typography variant="body2" sx={{ color: isAtrasada ? 'error.main' : 'text.secondary', fontWeight: isAtrasada ? 700 : 400 }}>
                  {new Date(tarefa.data_limite).toLocaleDateString('pt-BR')}
                </Typography>
              </Stack>
            </Stack>
          </>
        ) : null}
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* Seção de Comentários */}
      {tarefa && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <ComentarioSection
            tarefaId={tarefa.id}
            comentarios={tarefa.comentarios || []}
            onComentarioAdded={handleComentarioAdded}
          />
        </Paper>
      )}
    </Box>
  );
}
