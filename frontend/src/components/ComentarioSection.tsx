import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  Stack,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import { useSnackbar } from 'notistack';
import ComentarioService from '@/services/ComentarioService';
import type { IComentario } from '@/types';

interface ComentarioSectionProps {
  tarefaId: number;
  comentarios: IComentario[];
  onComentarioAdded: () => void;
}

export default function ComentarioSection({
  tarefaId,
  comentarios,
  onComentarioAdded,
}: ComentarioSectionProps) {
  const [autor, setAutor] = useState('');
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();


  const handleSubmit = useCallback(async () => {
    if (!autor.trim() || !texto.trim()) {
      enqueueSnackbar('Preencha todos os campos do comentário.', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await ComentarioService.criar({ tarefa_id: tarefaId, autor, texto });
      enqueueSnackbar('Comentário adicionado!', { variant: 'success' });
      setAutor('');
      setTexto('');
      onComentarioAdded(); // Dispara revalidação dos dados (SWR mutate)
    } catch {
      enqueueSnackbar('Erro ao adicionar comentário.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [autor, texto, tarefaId, onComentarioAdded, enqueueSnackbar]);

  return (
    <Box>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ChatBubbleOutlinedIcon />
        Comentários ({comentarios.length})
      </Typography>

      {/* Lista de comentários existentes */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {comentarios.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Nenhum comentário ainda.
          </Typography>
        ) : (
          comentarios.map((c) => (
            <Paper
              key={c.id}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                  {c.autor.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {c.autor}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  {new Date(c.data_criacao || c.created_at || '').toLocaleString('pt-BR')}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ pl: 5 }}>
                {c.texto}
              </Typography>
            </Paper>
          ))
        )}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Formulário de novo comentário */}
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Adicionar Comentário
      </Typography>
      <Stack spacing={1.5}>
        <TextField
          label="Seu nome"
          size="small"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          fullWidth
        />
        <TextField
          label="Comentário"
          multiline
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          fullWidth
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
