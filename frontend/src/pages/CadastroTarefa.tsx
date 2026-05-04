import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, MenuItem, Stack, CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import TarefaService from '@/services/TarefaService';
import type { TarefaPrioridade } from '@/types';

export default function CadastroTarefa() {
  const navigate = useNavigate();

  const { id: projetoIdParam, tarefaId } = useParams<{ id: string; tarefaId: string }>();
  const isEdit = Boolean(tarefaId);
  const { enqueueSnackbar } = useSnackbar();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<TarefaPrioridade>('media');
  const [responsavel, setResponsavel] = useState('');
  const [dataLimite, setDataLimite] = useState('');
  const [projetoId, setProjetoId] = useState(Number(projetoIdParam) || 0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (isEdit && tarefaId) {
      setLoadingData(true);
      TarefaService.obterPorId(Number(tarefaId))
        .then((t) => {
          setTitulo(t.titulo);
          setDescricao(t.descricao);
          setPrioridade(t.prioridade);
          setResponsavel(t.responsavel);
          setDataLimite(t.data_limite?.split('T')[0] || t.data_limite);
          setProjetoId(t.projeto_id);
        })
        .catch(() => { enqueueSnackbar('Erro ao carregar tarefa.', { variant: 'error' }); navigate(-1); })
        .finally(() => setLoadingData(false));
    }
  }, [tarefaId, isEdit, navigate, enqueueSnackbar]);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!titulo.trim()) e.titulo = 'Título é obrigatório';
    if (!descricao.trim()) e.descricao = 'Descrição é obrigatória';
    if (!responsavel.trim()) e.responsavel = 'Responsável é obrigatório';
    if (!dataLimite) e.data_limite = 'Data limite é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [titulo, descricao, responsavel, dataLimite]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { projeto_id: projetoId, titulo, descricao, prioridade, responsavel, data_limite: dataLimite };
      if (isEdit && tarefaId) {
        await TarefaService.atualizar(Number(tarefaId), payload);
        enqueueSnackbar('Tarefa atualizada com sucesso!', { variant: 'success' });
      } else {
        await TarefaService.criar(payload);
        enqueueSnackbar('Tarefa criada com sucesso!', { variant: 'success' });
      }
      navigate(`/projetos/${projetoId}`);
    } catch (err: any) {
      const be = err?.response?.data?.errors;
      if (be) { const m: Record<string, string> = {}; Object.keys(be).forEach((k) => { m[k] = be[k][0]; }); setErrors(m); }
      enqueueSnackbar('Erro ao salvar tarefa.', { variant: 'error' });
    } finally { setLoading(false); }
  }, [titulo, descricao, prioridade, responsavel, dataLimite, projetoId, isEdit, tarefaId, validate, navigate, enqueueSnackbar]);

  const goBack = useCallback(() => {
    if (projetoId) navigate(`/projetos/${projetoId}`);
    else navigate(-1);
  }, [projetoId, navigate]);

  if (loadingData) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={goBack} color="inherit">Voltar</Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</Typography>
      </Box>
      <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 700 }}>
        <Stack spacing={3}>
          <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} error={Boolean(errors.titulo)} helperText={errors.titulo} fullWidth required id="input-titulo" />
          <TextField label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} error={Boolean(errors.descricao)} helperText={errors.descricao} multiline rows={3} fullWidth required id="input-descricao" />
          <TextField label="Prioridade" select value={prioridade} onChange={(e) => setPrioridade(e.target.value as TarefaPrioridade)} fullWidth id="select-prioridade">
            <MenuItem value="baixa">🟢 Baixa</MenuItem>
            <MenuItem value="media">🟡 Média</MenuItem>
            <MenuItem value="alta">🔴 Alta</MenuItem>
          </TextField>
          <TextField label="Responsável" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} error={Boolean(errors.responsavel)} helperText={errors.responsavel} fullWidth required id="input-responsavel" />
          <TextField label="Data Limite" type="date" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} error={Boolean(errors.data_limite)} helperText={errors.data_limite} fullWidth required slotProps={{ inputLabel: { shrink: true } }} id="input-data-limite" />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
            <Button variant="outlined" onClick={goBack} disabled={loading}>Cancelar</Button>
            <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <SaveIcon />} onClick={handleSubmit} disabled={loading} id="btn-salvar-tarefa">
              {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Tarefa'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
