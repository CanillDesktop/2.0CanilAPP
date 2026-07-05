import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import {
  Alert,
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';
import { PainelErro } from '../../../shared/components/PainelErro';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import {
  type ValorCampoInteiro,
  campoInteiroPositivo,
  inteiroCampoParaEnvio,
  valorCampoInteiroDeInput,
} from '../../../shared/utils/campoInteiroFormulario';
import { useMutacaoEstoque } from '../hooks/useEstoque';
import { TipoEntradaEstoque } from '../types/tiposEntradaEstoque';
import type { TipoEntradaEstoqueValor } from '../types/tiposEntradaEstoque';

export function FormularioNovoLote() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { cores } = useTemaApp();
  const { permissoesAtivas, contexto } = useUnidadeEstoque();
  const campoSx = estilosCampoFormulario(cores);
  const { registrarEntrada, carregando, erro, errosValidacao } = useMutacaoEstoque();

  const idItem = useMemo(() => Number(params.get('idItem')) || 0, [params]);
  const codItem = useMemo(() => params.get('codItem') ?? '', [params]);

  const [tipoEntrada, setTipoEntrada] = useState<TipoEntradaEstoqueValor>(TipoEntradaEstoque.Compra);
  const [quantidade, setQuantidade] = useState<ValorCampoInteiro>('');
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [dataValidade, setDataValidade] = useState('');
  const [nfe, setNfe] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorDocumento, setFornecedorDocumento] = useState('');
  const [doadorNome, setDoadorNome] = useState('');
  const [doadorDocumento, setDoadorDocumento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [nivelMinimo, setNivelMinimo] = useState<ValorCampoInteiro>('');
  const [submitSucesso, setSubmitSucesso] = useState(false);
  const [submitErro, setSubmitErro] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const itemInvalido = idItem <= 0;
  const semPermissao = !permissoesAtivas?.podeEntrada;
  const unidadeNome = contexto?.unidadesDisponiveis.find((u) => u.id === contexto.unidadeAtivaId)?.nome ?? 'unidade ativa';

  const mensagemErro =
    erro ?? (itemInvalido ? 'Item inválido. Volte à listagem e selecione o item novamente.' : null) ??
    (semPermissao ? 'Você não tem permissão de entrada nesta unidade.' : null);

  const formularioValido = useMemo(() => {
    if (itemInvalido || semPermissao) return false;
    if (!campoInteiroPositivo(quantidade) || !dataEntrega.trim()) return false;
    if (tipoEntrada === TipoEntradaEstoque.Compra && !fornecedorNome.trim()) return false;
    if (tipoEntrada === TipoEntradaEstoque.Doacao && !doadorNome.trim()) return false;
    return true;
  }, [itemInvalido, semPermissao, quantidade, dataEntrega, tipoEntrada, fornecedorNome, doadorNome]);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido || carregando) return;
    setSubmitErro(false);
    setSubmitSucesso(false);

    const resultado = await registrarEntrada({
      idItem,
      tipoEntrada,
      quantidade: inteiroCampoParaEnvio(quantidade),
      dataEntrega: new Date(dataEntrega).toISOString(),
      dataValidade: dataValidade ? new Date(dataValidade).toISOString() : null,
      nfe: nfe || null,
      fornecedorNome: tipoEntrada === TipoEntradaEstoque.Compra ? fornecedorNome : null,
      fornecedorDocumento: tipoEntrada === TipoEntradaEstoque.Compra ? fornecedorDocumento || null : null,
      doadorNome: tipoEntrada === TipoEntradaEstoque.Doacao ? doadorNome : null,
      doadorDocumento: tipoEntrada === TipoEntradaEstoque.Doacao ? doadorDocumento || null : null,
      observacao: observacao || null,
      nivelMinimoEstoque: nivelMinimo === '' ? null : inteiroCampoParaEnvio(nivelMinimo),
    });

    if (!resultado.ok) {
      setSubmitErro(true);
      setSnackbar({ open: true, message: resultado.mensagem, severity: 'error' });
      return;
    }

    setSubmitSucesso(true);
    setSnackbar({
      open: true,
      message: 'Entrada registrada com sucesso.',
      severity: 'success',
    });
    window.setTimeout(() => navegar('/estoque'), 1200);
  }

  const botaoPrimario = !submitSucesso && !submitErro;

  return (
    <Box sx={{ backgroundColor: cores.bgConteudo, width: '100%', minHeight: '100%', py: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 2 } }}>
      <Card sx={{ width: '100%', maxWidth: 780, mx: 'auto', backgroundColor: cores.bgCard, border: `1px solid ${cores.border}`, borderRadius: 3, p: 3, boxShadow: cores.sombraCard }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box component="form" onSubmit={aoEnviar} noValidate>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: cores.textPrimary }}>
                  Entrada de estoque
                </Typography>
                <Typography variant="caption" sx={{ color: cores.textSecondary, display: 'block', mt: 0.5 }}>
                  Unidade: {unidadeNome}
                  {codItem ? ` · Item ${codItem}` : ''}
                </Typography>
              </Box>
              <PainelErro mensagem={mensagemErro} errosValidacao={errosValidacao} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth sx={campoSx}>
                    <InputLabel id="tipo-entrada-label">Tipo de entrada</InputLabel>
                    <Select
                      labelId="tipo-entrada-label"
                      label="Tipo de entrada"
                      value={tipoEntrada}
                      onChange={(e) => setTipoEntrada(Number(e.target.value) as TipoEntradaEstoqueValor)}
                    >
                      <MenuItem value={TipoEntradaEstoque.Compra}>Compra</MenuItem>
                      <MenuItem value={TipoEntradaEstoque.Doacao}>Doação</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantidade"
                    value={quantidade}
                    onChange={(e) => setQuantidade(valorCampoInteiroDeInput(e.target.value))}
                    slotProps={{ htmlInput: { min: 1 } }}
                    sx={campoSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
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
                    type="date"
                    label="Data de validade"
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={campoSx}
                  />
                </Grid>
                {tipoEntrada === TipoEntradaEstoque.Compra ? (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="Fornecedor"
                        value={fornecedorNome}
                        onChange={(e) => setFornecedorNome(e.target.value)}
                        sx={campoSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Documento do fornecedor"
                        value={fornecedorDocumento}
                        onChange={(e) => setFornecedorDocumento(e.target.value)}
                        sx={campoSx}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField fullWidth label="NF-e" value={nfe} onChange={(e) => setNfe(e.target.value)} sx={campoSx} />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="Doador"
                        value={doadorNome}
                        onChange={(e) => setDoadorNome(e.target.value)}
                        sx={campoSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Documento do doador"
                        value={doadorDocumento}
                        onChange={(e) => setDoadorDocumento(e.target.value)}
                        sx={campoSx}
                      />
                    </Grid>
                  </>
                )}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Observação"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    multiline
                    minRows={2}
                    sx={campoSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Nível mínimo (opcional)"
                    value={nivelMinimo}
                    onChange={(e) => setNivelMinimo(valorCampoInteiroDeInput(e.target.value))}
                    slotProps={{ htmlInput: { min: 0 } }}
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
                  ...(botaoPrimario && {
                    backgroundColor: cores.accent,
                    color: cores.textOnAccent,
                    '&:hover': { backgroundColor: cores.accentHover, transform: 'scale(1.02)' },
                  }),
                }}
              >
                {submitSucesso ? 'Entrada registrada' : 'Registrar entrada'}
              </LoadingButton>
            </Stack>
          </Box>
        </CardContent>
      </Card>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
