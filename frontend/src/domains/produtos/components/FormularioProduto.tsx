import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  Card,
  Collapse,
  CssBaseline,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { PainelErro } from '../../../shared/components/PainelErro';
import { mapearPapelUsuario } from '../../../shared/types/papelUsuario';
import { SidebarEstoque } from '../../estoque/components/SidebarEstoque';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import { servicoProdutos } from '../services/servicoProdutos';
import type { ProdutoCadastroDto } from '../types/tiposProdutos';

function gerarCodigoProduto(): string {
  const sufixo = crypto.randomUUID().replace(/\D/g, '').slice(0, 10);
  return `WEB${sufixo}`;
}

const temaFormularioProduto = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617',
      paper: '#0f172a',
    },
    text: {
      primary: '#e2e8f0',
      secondary: 'rgba(203, 213, 225, 0.85)',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const OPCOES_CATEGORIA = [
  { valor: 1, rotulo: 'Ração' },
  { valor: 2, rotulo: 'Higiene' },
  { valor: 3, rotulo: 'Acessório' },
];

const OPCOES_UNIDADE = [
  { valor: 1, rotulo: 'Unidade' },
  { valor: 2, rotulo: 'Kg' },
  { valor: 3, rotulo: 'Litro' },
];

export function FormularioProduto() {
  const navegar = useNavigate();
  const { usuario } = useAutenticacao();
  const papelUsuario = mapearPapelUsuario(usuario?.permissao);
  const { criar, carregando, erro } = useMutacaoProduto();
  const themeExterno = useTheme();
  const isMobile = useMediaQuery(themeExterno.breakpoints.down('sm'));
  const ehMobileMenu = useMediaQuery(themeExterno.breakpoints.down('md'));
  const [drawerAbertoMobile, setDrawerAbertoMobile] = useState(false);
  const [codProduto] = useState(() => gerarCodigoProduto());
  const [descricaoSimples, setDescricaoSimples] = useState('');
  const [descricaoDetalhada, setDescricaoDetalhada] = useState('');
  const [unidade, setUnidade] = useState(1);
  const [categoria, setCategoria] = useState(1);
  const [cadastrarEstoqueInicial, setCadastrarEstoqueInicial] = useState(true);
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [nfe, setNfe] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [nivelMinimoEstoque, setNivelMinimoEstoque] = useState(0);
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
    const baseValida =
      descricaoSimples.trim().length > 0 &&
      Number.isFinite(unidade) &&
      unidade > 0 &&
      Number.isFinite(categoria) &&
      categoria > 0 &&
      Number.isFinite(nivelMinimoEstoque) &&
      nivelMinimoEstoque >= 0;

    if (!cadastrarEstoqueInicial) return baseValida;

    return (
      baseValida &&
      lote.trim().length > 0 &&
      Number.isFinite(quantidade) &&
      quantidade > 0 &&
      dataEntrega.trim().length > 0
    );
  }, [descricaoSimples, unidade, categoria, nivelMinimoEstoque, cadastrarEstoqueInicial, lote, quantidade, dataEntrega]);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido || carregando) return;
    setSubmitErro(false);
    setSubmitSucesso(false);

    const dto: ProdutoCadastroDto = {
      idProduto: 0,
      codProduto,
      descricaoSimples,
      descricaoDetalhada,
      unidade,
      categoria,
      lote: cadastrarEstoqueInicial ? lote : null,
      quantidade: cadastrarEstoqueInicial ? quantidade : 0,
      dataEntrega: new Date(dataEntrega).toISOString(),
      nfe,
      dataValidade: dataValidade ? new Date(dataValidade).toISOString() : null,
      nivelMinimoEstoque,
    };

    const ok = await criar(dto);
    if (!ok) {
      setSubmitErro(true);
      setSnackbar({
        open: true,
        message: 'Erro ao criar produto. Verifique os dados e tente novamente.',
        severity: 'error',
      });
      return;
    }

    setSubmitSucesso(true);
    setSnackbar({
      open: true,
      message: 'Produto criado com sucesso! Redirecionando...',
      severity: 'success',
    });
    window.setTimeout(async () => {
      try {
        const encontrados = await servicoProdutos.listar({ codProduto });
        const criado = encontrados.find((item) => item.codItem === codProduto) ?? encontrados[0];
        if (criado) {
          navegar(`/produtos/${criado.idItem}`);
          return;
        }
      } catch {
        /* ignore: fallback de rota */
      }
      navegar('/produtos');
    }, 550);
  }

  return (
    <ThemeProvider theme={temaFormularioProduto}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#020617' }}>
        <SidebarEstoque
          abertoMobile={drawerAbertoMobile}
          aoFecharMobile={() => setDrawerAbertoMobile(false)}
          ehMobile={ehMobileMenu}
          papelUsuario={papelUsuario}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            pt: 2,
            pb: 4,
          }}
        >
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            {ehMobileMenu ? (
              <IconButton color="inherit" onClick={() => setDrawerAbertoMobile(true)} sx={{ color: '#e2e8f0' }}>
                <MenuOutlinedIcon />
              </IconButton>
            ) : (
              <Box />
            )}
            <Button variant="text" onClick={() => navegar('/produtos')} sx={{ color: 'rgba(203, 213, 225, 0.95)' }}>
              Voltar para produtos
            </Button>
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 800, color: '#e2e8f0', mb: 0.7 }}>
            Novo produto
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)', mb: 3 }}>
            Preencha os dados essenciais e, se necessário, já registre o estoque inicial.
          </Typography>

          <PainelErro mensagem={erro} />

          <Box component="form" onSubmit={aoEnviar}>
            <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, bgcolor: '#0f172a' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Dados do Produto
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Código"
                    value={codProduto}
                    slotProps={{ input: { readOnly: true } }}
                    helperText="Gerado automaticamente"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    required
                    label="Nome / descrição simples"
                    value={descricaoSimples}
                    onChange={(e) => setDescricaoSimples(e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Descrição detalhada"
                    value={descricaoDetalhada}
                    onChange={(e) => setDescricaoDetalhada(e.target.value)}
                    multiline
                    minRows={3}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="categoria-label">Categoria</InputLabel>
                    <Select
                      labelId="categoria-label"
                      label="Categoria"
                      value={categoria}
                      onChange={(e) => setCategoria(Number(e.target.value))}
                    >
                      {OPCOES_CATEGORIA.map((opcao) => (
                        <MenuItem key={opcao.valor} value={opcao.valor}>
                          {opcao.rotulo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="unidade-label">Unidade</InputLabel>
                    <Select
                      labelId="unidade-label"
                      label="Unidade"
                      value={unidade}
                      onChange={(e) => setUnidade(Number(e.target.value))}
                    >
                      {OPCOES_UNIDADE.map((opcao) => (
                        <MenuItem key={opcao.valor} value={opcao.valor}>
                          {opcao.rotulo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, bgcolor: '#0f172a' }}>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                sx={{ justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Estoque Inicial
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cadastrarEstoqueInicial}
                      onChange={(e) => setCadastrarEstoqueInicial(e.target.checked)}
                    />
                  }
                  label="Cadastrar estoque inicial"
                />
              </Stack>

              <Collapse in={cadastrarEstoqueInicial}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth required={cadastrarEstoqueInicial} label="Lote inicial" value={lote} onChange={(e) => setLote(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required={cadastrarEstoqueInicial}
                      type="number"
                      label="Quantidade inicial"
                      value={quantidade}
                      onChange={(e) => setQuantidade(Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      required={cadastrarEstoqueInicial}
                      type="date"
                      label="Data de entrada"
                      value={dataEntrega}
                      onChange={(e) => setDataEntrega(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
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
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth label="Documento (NF)" value={nfe} onChange={(e) => setNfe(e.target.value)} />
                  </Grid>
                </Grid>
              </Collapse>
            </Card>

            <Card sx={{ p: { xs: 2, sm: 3 }, mb: 1, borderRadius: 3, bgcolor: '#0f172a' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Configurações
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Nível mínimo de estoque"
                    value={nivelMinimoEstoque}
                    onChange={(e) => setNivelMinimoEstoque(Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>
              </Grid>
            </Card>

            <LoadingButton
              type="submit"
              loading={carregando}
              loadingPosition="start"
              startIcon={submitSucesso ? <CheckIcon /> : submitErro ? <SendIcon /> : <SaveIcon />}
              variant="contained"
              size="large"
              fullWidth
              disabled={!formularioValido || carregando}
              color={submitSucesso ? 'success' : submitErro ? 'error' : 'primary'}
              sx={{
                mt: 3,
                fontWeight: 800,
                borderRadius: 2,
                py: 1.2,
                transition: '0.2s',
                '&:hover': { transform: 'scale(1.02)' },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              {submitSucesso ? 'Criado com sucesso' : 'Criar produto'}
            </LoadingButton>
          </Box>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar((estado) => ({ ...estado, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              severity={snackbar.severity}
              variant="filled"
              onClose={() => setSnackbar((estado) => ({ ...estado, open: false }))}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
