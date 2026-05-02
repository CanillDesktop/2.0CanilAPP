import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useMutacaoEstoque } from '../hooks/useEstoque';
import type { ItemEstoqueDto } from '../types/tiposEstoque';

const COLORS = {
  background: '#020617',
  card: '#0f172a',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  border: 'rgba(255,255,255,0.08)',
} as const;

const textFieldSx = {
  '& .MuiInputLabel-root': {
    color: COLORS.textSecondary,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#3b82f6',
  },
  '& .MuiOutlinedInput-input': {
    color: COLORS.textPrimary,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: COLORS.border,
    },
    '&:hover fieldset': {
      borderColor: '#3b82f6',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6',
    },
  },
} as const;

export function FormularioNovoLote() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { criarLote, carregando, erro, errosValidacao } = useMutacaoEstoque();

  const inicialIdItem = useMemo(() => Number(params.get('idItem')) || 0, [params]);
  const inicialCodItem = useMemo(() => params.get('codItem') ?? '', [params]);

  const [idItem, setIdItem] = useState(inicialIdItem);
  const [codItem, setCodItem] = useState(inicialCodItem);

  useEffect(() => {
    setIdItem(inicialIdItem);
    setCodItem(inicialCodItem);
  }, [inicialIdItem, inicialCodItem]);
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [nfe, setNfe] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [submitSucesso, setSubmitSucesso] = useState(false);
  const [submitErro, setSubmitErro] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const formularioValido = useMemo(() => {
    return idItem > 0 && codItem.trim().length > 0 && lote.trim().length > 0 && quantidade > 0 && dataEntrega.trim().length > 0;
  }, [idItem, codItem, lote, quantidade, dataEntrega]);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido || carregando) return;
    setSubmitErro(false);
    setSubmitSucesso(false);

    const dto: ItemEstoqueDto = {
      id: idItem,
      codigo: codItem,
      lote,
      quantidade,
      dataEntrega: new Date(dataEntrega).toISOString(),
      nfe,
      dataValidade: dataValidade ? new Date(dataValidade).toISOString() : null,
    };
    const ok = await criarLote(dto);
    if (!ok) {
      setSubmitErro(true);
      setSnackbar({
        open: true,
        message: erro ?? 'Erro ao salvar lote.',
        severity: 'error',
      });
      return;
    }

    setSubmitSucesso(true);
    setSnackbar({
      open: true,
      message: 'Lote adicionado com sucesso.',
      severity: 'success',
    });
    window.setTimeout(() => navegar('/estoque'), 850);
  }

  const botaoPrimario = !submitSucesso && !submitErro;

  return (
    <Box
      sx={{
        backgroundColor: COLORS.background,
        width: '100%',
        minHeight: '100%',
        py: { xs: 2, sm: 3 },
        px: { xs: 1.5, sm: 2 },
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 780,
          mx: 'auto',
          backgroundColor: COLORS.card,
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 3,
          p: 3,
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box component="form" onSubmit={aoEnviar}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
                  Novo lote no estoque
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mt: 0.5 }}>
                  Campos obrigatórios: item, lote, quantidade e data de entrega.
                </Typography>
              </Box>
              <PainelErro mensagem={erro} errosValidacao={errosValidacao} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="number"
                    label="ID do item"
                    value={idItem}
                    onChange={(e) => setIdItem(Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 1 } }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Código do item"
                    value={codItem}
                    onChange={(e) => setCodItem(e.target.value)}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Lote"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="number"
                    label="Quantidade"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 1 } }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="date"
                    label="Data de entrega"
                    value={dataEntrega}
                    onChange={(e) => setDataEntrega(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="date"
                    label="Data de validade"
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Documento (NF-e)"
                    value={nfe}
                    onChange={(e) => setNfe(e.target.value)}
                    sx={textFieldSx}
                  />
                </Grid>
              </Grid>
              <LoadingButton
                type="submit"
                loading={carregando}
                loadingPosition="start"
                startIcon={submitSucesso ? <CheckIcon /> : <SaveIcon />}
                variant="contained"
                fullWidth
                disabled={!formularioValido || carregando}
                color={submitSucesso ? 'success' : submitErro ? 'error' : 'primary'}
                sx={{
                  mt: 3,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  transition: '0.2s',
                  ...(botaoPrimario && {
                    backgroundColor: '#2563eb',
                    '&:hover': {
                      backgroundColor: '#1d4ed8',
                      transform: 'scale(1.02)',
                    },
                  }),
                  ...(!botaoPrimario && {
                    '&:hover': { transform: 'scale(1.02)' },
                  }),
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                {submitSucesso ? 'Lote criado com sucesso' : 'Salvar lote'}
              </LoadingButton>
            </Stack>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((estado) => ({ ...estado, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((estado) => ({ ...estado, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
