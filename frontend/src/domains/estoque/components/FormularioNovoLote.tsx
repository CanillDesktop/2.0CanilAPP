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
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { PainelErro } from '../../../shared/components/PainelErro';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useMutacaoEstoque } from '../hooks/useEstoque';
import { servicoEstoque } from '../services/servicoEstoque';
import type { ItemEstoqueDto } from '../types/tiposEstoque';

export function FormularioNovoLote() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { cores } = useTemaApp();
  const campoSx = estilosCampoFormulario(cores);
  const { criarLote, carregando, erro, errosValidacao } = useMutacaoEstoque();

  // O Id do item vem da navegação e é mantido apenas no estado da aplicação — nunca exibido ao usuário.
  const idItem = useMemo(() => Number(params.get('idItem')) || 0, [params]);
  const inicialCodItem = useMemo(() => params.get('codItem') ?? '', [params]);

  const [codItem, setCodItem] = useState(inicialCodItem);
  const [lote, setLote] = useState('');
  const [carregandoLote, setCarregandoLote] = useState(false);
  const [erroLote, setErroLote] = useState<string | null>(null);

  // Código e lote são gerados/definidos exclusivamente pelo backend (LoteGeradorService),
  // carregados automaticamente apenas para conferência. O usuário não edita esses campos.
  useEffect(() => {
    if (idItem <= 0) return;
    let ativo = true;
    const carregarLote = async () => {
      setCarregandoLote(true);
      setErroLote(null);
      try {
        const dados = await servicoEstoque.obterProximoLote(idItem);
        if (!ativo) return;
        setLote(dados.lote);
        setCodItem((atual) => atual || dados.codigo);
      } catch (e) {
        if (ativo) setErroLote(extrairMensagemErroApi(e));
      } finally {
        if (ativo) setCarregandoLote(false);
      }
    };
    void carregarLote();
    return () => {
      ativo = false;
    };
  }, [idItem]);

  const itemInvalido = idItem <= 0;
  const mensagemErro = erro ?? erroLote ?? (itemInvalido ? 'Item inválido. Volte à listagem e selecione o item novamente.' : null);

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
    return idItem > 0 && lote.trim().length > 0 && quantidade > 0 && dataEntrega.trim().length > 0;
  }, [idItem, lote, quantidade, dataEntrega]);

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
    const resultado = await criarLote(dto);
    if (!resultado.ok) {
      setSubmitErro(true);
      setSnackbar({
        open: true,
        message: resultado.mensagem,
        severity: 'error',
      });
      return;
    }

    const loteCadastrado = resultado.dados?.lote ?? lote;
    setSubmitSucesso(true);
    setSnackbar({
      open: true,
      message: `Lote ${loteCadastrado} cadastrado com sucesso.`,
      severity: 'success',
    });
    window.setTimeout(() => navegar('/estoque'), 1200);
  }

  const botaoPrimario = !submitSucesso && !submitErro;

  return (
    <Box
      sx={{
        backgroundColor: cores.bgConteudo,
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
          backgroundColor: cores.bgCard,
          border: `1px solid ${cores.border}`,
          borderRadius: 3,
          p: 3,
          boxShadow: cores.sombraCard,
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box component="form" onSubmit={aoEnviar}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: cores.textPrimary }}>
                  Novo lote no estoque
                </Typography>
                <Typography variant="caption" sx={{ color: cores.textSecondary, display: 'block', mt: 0.5 }}>
                  Campos obrigatórios: item, lote, quantidade e data de entrega.
                </Typography>
              </Box>
              <PainelErro mensagem={mensagemErro} errosValidacao={errosValidacao} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Código do item"
                    value={codItem}
                    slotProps={{ input: { readOnly: true } }}
                    helperText="Identificador do item (somente leitura)."
                    sx={campoSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Lote"
                    value={carregandoLote ? 'Gerando lote…' : lote}
                    slotProps={{ input: { readOnly: true } }}
                    helperText="Gerado automaticamente pelo sistema (somente leitura)."
                    sx={campoSx}
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
                    sx={campoSx}
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
                    sx={campoSx}
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
                    sx={campoSx}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Documento (NF-e)"
                    value={nfe}
                    onChange={(e) => setNfe(e.target.value)}
                    sx={campoSx}
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
                    backgroundColor: cores.accent,
                    color: cores.textOnAccent,
                    '&:hover': {
                      backgroundColor: cores.accentHover,
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
