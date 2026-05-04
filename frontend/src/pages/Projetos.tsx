import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Stack,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useSnackbar } from 'notistack';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { fetchEntity } from '@/services/api';
import ProjetoService from '@/services/ProjetoService';
import DialogConfirmacao from '@/components/DialogConfirmacao';
import type { IProjeto, IResumo } from '@/types';

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

type Order = 'asc' | 'desc';
type OrderBy = 'id' | 'nome' | 'status' | 'data_criacao';

export default function Projetos() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // --- SWR: Data fetching declarativo ---
  // O useSWR mantém cache, revalida ao focar, e deduplica requests.
  const { data: projetos, error, isLoading, mutate } = useSWR<IProjeto[]>(
    '/projetos',
    fetchEntity
  );

  // Projeto selecionado para exibir o gráfico de resumo
  const [selectedProjetoId, setSelectedProjetoId] = useState<number | null>(null);

  // SWR para o resumo do primeiro projeto (ou selecionado)
  const resumoProjetoId = selectedProjetoId ?? projetos?.[0]?.id;
  const { data: resumo } = useSWR<IResumo[]>(
    resumoProjetoId ? `/projetos/${resumoProjetoId}/resumo` : null,
    fetchEntity
  );

  // Estado da tabela
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('id');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado do filtro de status
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  // Estado do dialog de exclusão
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; projeto?: IProjeto }>({
    open: false,
  });
  const [deleting, setDeleting] = useState(false);

  // --- useMemo: Filtragem por status ---
  const filteredProjetos = useMemo(() => {
    if (!projetos) return [];
    if (statusFilter === 'todos') return projetos;
    return projetos.filter((p) => p.status === statusFilter);
  }, [projetos, statusFilter]);

  // --- useMemo: Ordenação memoizada para evitar recálculo a cada render ---
  const sortedProjetos = useMemo(() => {
    return [...filteredProjetos].sort((a, b) => {
      const aVal = a[orderBy] ?? '';
      const bVal = b[orderBy] ?? '';
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProjetos, order, orderBy]);

  // Dados paginados
  const paginatedProjetos = useMemo(() => {
    return sortedProjetos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedProjetos, page, rowsPerPage]);

  // Handler de ordenação
  const handleSort = useCallback((column: OrderBy) => {
    setOrder((prev) => (orderBy === column && prev === 'asc' ? 'desc' : 'asc'));
    setOrderBy(column);
  }, [orderBy]);

  // Handler de exclusão
  const handleDelete = useCallback(async () => {
    if (!deleteDialog.projeto) return;
    setDeleting(true);
    try {
      await ProjetoService.excluir(deleteDialog.projeto.id);
      enqueueSnackbar('Projeto excluído com sucesso!', { variant: 'success' });
      mutate(); // Revalida a lista via SWR
      setDeleteDialog({ open: false });
    } catch {
      enqueueSnackbar('Erro ao excluir projeto.', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  }, [deleteDialog.projeto, enqueueSnackbar, mutate]);

  // --- Dados do gráfico Chart.js ---
  const chartData = useMemo(() => {
    const statusLabels: Record<string, string> = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      concluida: 'Concluída',
    };
    const statusColors: Record<string, string> = {
      pendente: '#FFB020',
      em_andamento: '#6C63FF',
      concluida: '#00D9A5',
    };

    return {
      labels: (resumo || []).map((r) => statusLabels[r.status] || r.status),
      datasets: [
        {
          label: 'Tarefas',
          data: (resumo || []).map((r) => r.total),
          backgroundColor: (resumo || []).map((r) => statusColors[r.status] || '#999'),
          borderRadius: 8,
          borderSkipped: false as const,
        },
      ],
    };
  }, [resumo]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Resumo de Tarefas — ${projetos?.find((p) => p.id === resumoProjetoId)?.nome || ''}`,
          color: '#fff',
          font: { size: 14, weight: 600 as const },
        },
      },
      scales: {
        x: {
          ticks: { color: '#94A3B8' },
          grid: { display: false },
        },
        y: {
          ticks: { color: '#94A3B8', stepSize: 1 },
          grid: { color: 'rgba(148,163,184,0.1)' },
        },
      },
    }),
    [projetos, resumoProjetoId]
  );

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Erro ao carregar projetos. Verifique se o backend está rodando.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Projetos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gerencie seus projetos e acompanhe o progresso das tarefas.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Filtro por status */}
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(_, val) => { if (val) { setStatusFilter(val); setPage(0); } }}
            size="small"
            id="filtro-status"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              },
            }}
          >
            <ToggleButton value="todos">Todos</ToggleButton>
            <ToggleButton value="ativo">Ativos</ToggleButton>
            <ToggleButton value="inativo">Inativos</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projetos/cadastro')}
            id="btn-novo-projeto"
          >
            Novo Projeto
          </Button>
        </Box>
      </Box>

      {/* Dashboard: Cards de resumo + Gráfico */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 2fr' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Card: Total de Projetos */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <FolderIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {isLoading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : projetos?.length ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total de Projetos
            </Typography>
          </CardContent>
        </Card>

        {/* Card: Projetos Ativos */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <AssignmentIcon sx={{ fontSize: 36, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {isLoading ? (
                <Skeleton width={40} sx={{ mx: 'auto' }} />
              ) : (
                projetos?.filter((p) => p.status === 'ativo').length ?? 0
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Projetos Ativos
            </Typography>
          </CardContent>
        </Card>

        {/* Card: Projetos Inativos */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <AssignmentIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {isLoading ? (
                <Skeleton width={40} sx={{ mx: 'auto' }} />
              ) : (
                projetos?.filter((p) => p.status === 'inativo').length ?? 0
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Projetos Inativos
            </Typography>
          </CardContent>
        </Card>

        {/* Gráfico de resumo do primeiro projeto */}
        <Card>
          <CardContent sx={{ height: 200 }}>
            {resumo && resumo.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {isLoading ? 'Carregando...' : 'Selecione um projeto para ver o resumo'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Tabela de projetos */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => handleSort('id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'nome'}
                    direction={orderBy === 'nome' ? order : 'asc'}
                    onClick={() => handleSort('nome')}
                  >
                    Nome
                  </TableSortLabel>
                </TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'data_criacao'}
                    direction={orderBy === 'data_criacao' ? order : 'asc'}
                    onClick={() => handleSort('data_criacao')}
                  >
                    Criação
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Skeleton loading
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedProjetos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      Nenhum projeto encontrado. Crie seu primeiro projeto!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProjetos.map((projeto) => (
                  <TableRow
                    key={projeto.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.04)' },
                    }}
                    onClick={() => {
                      setSelectedProjetoId(projeto.id);
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{projeto.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {projeto.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {projeto.descricao}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {/* Chip colorido para status: ativo = verde, inativo = cinza */}
                      <Chip
                        label={projeto.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor:
                            projeto.status === 'ativo'
                              ? 'rgba(0, 217, 165, 0.15)'
                              : 'rgba(148, 163, 184, 0.15)',
                          color:
                            projeto.status === 'ativo' ? '#00D9A5' : '#94A3B8',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(projeto.data_criacao || projeto.created_at || '').toLocaleDateString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projetos/${projeto.id}`);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projetos/${projeto.id}/editar`);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ open: true, projeto });
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sortedProjetos.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Dialog de confirmação de exclusão */}
      <DialogConfirmacao
        open={deleteDialog.open}
        message={`Tem certeza que deseja excluir o projeto "${deleteDialog.projeto?.nome}"? Esta ação é irreversível.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false })}
        loading={deleting}
      />
    </Box>
  );
}
