import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, MenuItem, Stack, CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import ProjetoService from '@/services/ProjetoService';
import type { ProjetoStatus } from '@/types';

export default function CadastroProjeto() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { enqueueSnackbar } = useSnackbar();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<ProjetoStatus>('ativo');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      ProjetoService.obterPorId(Number(id))
        .then((projeto) => { setNome(projeto.nome); setDescricao(projeto.descricao); setStatus(projeto.status); })
        .catch(() => { enqueueSnackbar('Erro ao carregar projeto.', { variant: 'error' }); navigate('/projetos'); })
        .finally(() => setLoadingData(false));
    }
  }, [id, isEdit, navigate, enqueueSnackbar]);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'Nome é obrigatório';
    if (!descricao.trim()) e.descricao = 'Descrição é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [nome, descricao]);


  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        await ProjetoService.atualizar(Number(id), { nome, descricao, status });
        enqueueSnackbar('Projeto atualizado com sucesso!', { variant: 'success' });
      } else {
        await ProjetoService.criar({ nome, descricao, status });
        enqueueSnackbar('Projeto criado com sucesso!', { variant: 'success' });
      }
      navigate('/projetos');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      const be = error?.response?.data?.errors;
      if (be) { const m: Record<string, string> = {}; Object.keys(be).forEach((k) => { m[k] = be[k][0]; }); setErrors(m); }
      enqueueSnackbar('Erro ao salvar projeto.', { variant: 'error' });
    } finally { setLoading(false); }
  }, [nome, descricao, status, isEdit, id, validate, navigate, enqueueSnackbar]);

  if (loadingData) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projetos')} color="inherit">Voltar</Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</Typography>
      </Box>
      <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 700 }}>
        <Stack spacing={3}>
          <TextField label="Nome do Projeto" value={nome} onChange={(e) => setNome(e.target.value)} error={Boolean(errors.nome)} helperText={errors.nome} fullWidth required id="input-nome" />
          <TextField label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} error={Boolean(errors.descricao)} helperText={errors.descricao} multiline rows={4} fullWidth required id="input-descricao" />
          <TextField label="Status" select value={status} onChange={(e) => setStatus(e.target.value as ProjetoStatus)} fullWidth id="select-status">
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
          </TextField>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
            <Button variant="outlined" onClick={() => navigate('/projetos')} disabled={loading}>Cancelar</Button>
            <Button variant="contained" startIcon={loading ? <CircularProgress size={18} /> : <SaveIcon />} onClick={handleSubmit} disabled={loading} id="btn-salvar">
              {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Projeto'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
