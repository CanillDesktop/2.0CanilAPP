import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutacaoEstoque } from '../hooks/useEstoque';
import type { RetiradaEstoqueDto, RetiradaNavegacaoState, RetiradaRequest } from '../types/tiposEstoque';

export function FormularioRetirada() {
  const navegar = useNavigate();
  const location = useLocation();
  const data = location.state as RetiradaNavegacaoState | undefined;
  const { registrarRetirada, carregando, erro } = useMutacaoEstoque();
  const [de, setDe] = useState('');
  const [para, setPara] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [confirmarAberto, setConfirmarAberto] = useState(false);
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

  const quantidadeDisponivel = data?.quantidadeDisponivel ?? 0;
  const retiradaValida = useMemo(() => {
    return Boolean(data) && de.trim().length > 0 && para.trim().length > 0 && quantidade > 0 && quantidade <= quantidadeDisponivel;
  }, [data, de, para, quantidade, quantidadeDisponivel]);

  function validarFormulario() {
    if (!data) return 'A retirada deve ser iniciada a partir de um lote na tela de produto.';
    if (!de.trim()) return 'Informe quem esta retirando.';
    if (!para.trim()) return 'Informe para quem o item sera destinado.';
    if (!Number.isFinite(quantidade) || quantidade <= 0) return 'A quantidade deve ser maior que zero.';
    if (quantidade > quantidadeDisponivel) return 'Quantidade maior que o disponivel no lote.';
    return null;
  }

  async function confirmarRetirada() {
    if (carregando) return;
    const validacao = validarFormulario();
    if (validacao) {
      setErroValidacao(validacao);
      setConfirmarAberto(false);
      setSubmitErro(true);
      setSnackbar({
        open: true,
        message: validacao,
        severity: 'error',
      });
      return;
    }

    const payloadRetirada: RetiradaRequest = {
      loteId: data!.loteId,
      quantidade,
      origem: de,
      destino: para,
    };

    const dto: RetiradaEstoqueDto = {
      idRetirada: 0,
      codItem: data!.codItem,
      nomeItem: data!.produtoNome,
      lote: data!.loteCodigo,
      de: payloadRetirada.origem,
      para: payloadRetirada.destino,
      quantidade: payloadRetirada.quantidade,
      dataHoraInsercaoRegistro: new Date().toISOString(),
    };

    const ok = await registrarRetirada(dto);
    setConfirmarAberto(false);
    if (ok) {
      setSubmitSucesso(true);
      setSubmitErro(false);
      setSnackbar({
        open: true,
        message: 'Retirada realizada com sucesso.',
        severity: 'success',
      });
      window.setTimeout(() => {
        if (data?.retornoRota) navegar(`${data.retornoRota}?refresh=${Date.now()}`);
        else navegar(-1);
      }, 850);
      return;
    }
    setSubmitErro(true);
    setSubmitSucesso(false);
    setSnackbar({
      open: true,
      message: erro ?? 'Erro ao registrar retirada.',
      severity: 'error',
    });
  }

  const campoSx = {
    mb: 2,
    '& .MuiInputLabel-root': {
      color: '#cbd5e1',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#7dd3fc',
    },
    '& .MuiInputBase-input.Mui-disabled': {
      color: '#e2e8f0',
      WebkitTextFillColor: '#e2e8f0',
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#020617',
      color: '#fff',
      '& fieldset': {
        borderColor: 'rgba(148,163,184,0.35)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(125,211,252,0.7)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#38bdf8',
      },
    },
  };

  if (!data) {
    return (
      <Box sx={{ width: '100%', maxWidth: 600, p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Dados da retirada nao foram informados.
        </Alert>
        <Button variant="contained" onClick={() => navegar('/produtos')}>
          Voltar para produtos
        </Button>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 600,
        p: 1,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.12)',
        backgroundColor: '#0f172a',
      }}
    >
      <CardContent>
        <Stack sx={{ gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
              Registrar retirada
            </Typography>
            <Button onClick={() => navegar(-1)}>Voltar</Button>
          </Box>

          {(erro || erroValidacao) && <Alert severity="error">{erroValidacao ?? erro}</Alert>}

          <TextField label="Produto" value={data.produtoNome} disabled fullWidth sx={campoSx} />
          <TextField label="Lote" value={data.loteCodigo} disabled fullWidth sx={campoSx} />
          <TextField label="Quantidade disponivel" value={String(quantidadeDisponivel)} disabled fullWidth sx={campoSx} />

          <TextField
            label="Quem esta retirando"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            required
            fullWidth
            error={!de.trim() && Boolean(erroValidacao)}
            helperText={!de.trim() && Boolean(erroValidacao) ? 'Campo obrigatorio' : ' '}
            sx={campoSx}
          />
          <TextField
            label="Para quem"
            value={para}
            onChange={(e) => setPara(e.target.value)}
            required
            fullWidth
            error={!para.trim() && Boolean(erroValidacao)}
            helperText={!para.trim() && Boolean(erroValidacao) ? 'Campo obrigatorio' : ' '}
            sx={campoSx}
          />
          <TextField
            label="Quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 1, max: quantidadeDisponivel } }}
            required
            fullWidth
            error={Boolean(erroValidacao) && (!Number.isFinite(quantidade) || quantidade <= 0 || quantidade > quantidadeDisponivel)}
            helperText={
              Boolean(erroValidacao) && quantidade > quantidadeDisponivel
                ? 'Quantidade maior que o disponivel'
                : Boolean(erroValidacao) && quantidade <= 0
                  ? 'Quantidade deve ser maior que zero'
                  : ' '
            }
            sx={campoSx}
          />

          <Box sx={{ display: 'flex' }}>
            <LoadingButton
              loading={carregando}
              loadingPosition="start"
              startIcon={submitSucesso ? <CheckIcon /> : <SaveIcon />}
              color={submitSucesso ? 'success' : submitErro ? 'error' : 'primary'}
              variant="contained"
              fullWidth
              size="large"
              onClick={() => {
                if (carregando) return;
                const validacao = validarFormulario();
                if (validacao) {
                  setErroValidacao(validacao);
                  setSubmitErro(true);
                  return;
                }
                setErroValidacao(null);
                setSubmitErro(false);
                setConfirmarAberto(true);
              }}
              disabled={!retiradaValida || carregando}
              sx={{
                mt: 1,
                fontWeight: 700,
                borderRadius: 2,
                backgroundColor: '#7dd3fc',
                color: '#082f49',
                '&:hover': {
                  backgroundColor: '#38bdf8',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(125,211,252,0.25)',
                  color: 'rgba(226,232,240,0.55)',
                },
              }}
            >
              {submitSucesso ? 'Retirada confirmada' : 'Confirmar retirada'}
            </LoadingButton>
          </Box>
        </Stack>
      </CardContent>

      <Dialog
        open={confirmarAberto}
        onClose={() => setConfirmarAberto(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
            },
          },
        }}
      >
        <DialogTitle sx={{ color: '#e2e8f0', fontWeight: 700 }}>Confirmar retirada</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
            Confirma a retirada de {quantidade} unidade(s) do lote {data.loteCodigo}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarAberto(false)} sx={{ color: '#93c5fd' }}>
            Cancelar
          </Button>
          <LoadingButton
            loading={carregando}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={confirmarRetirada}
            disabled={carregando}
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' },
            }}
          >
            Confirmar
          </LoadingButton>
        </DialogActions>
      </Dialog>

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
    </Card>
  );
}
