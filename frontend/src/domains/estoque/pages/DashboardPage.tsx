import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  CssBaseline,
  Grid,
  IconButton,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { mapearPapelUsuario } from '../../../shared/types/papelUsuario';
import { listarInsumosApi } from '../../insumos/api/insumosApi';
import { listarMedicamentosApi } from '../../medicamentos/api/medicamentosApi';
import { listarProdutosApi } from '../../produtos/api/produtosApi';
import { AlertaCard } from '../components/AlertaCard';
import { BuscaCategoriaTabs } from '../components/BuscaCategoriaTabs';
import { ResumoItensCadastrados, type ContagemPorClasse } from '../components/ResumoItensCadastrados';
import { SidebarEstoque } from '../components/SidebarEstoque';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

const temaDashboard = createTheme({
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
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const MotionBox = motion(Box);
const SPACING = {
  sm: 2,
  md: 3,
  lg: 4,
} as const;

const CHIPS_CATEGORIA_ALERTAS: { valor: '' | LinhaOperacionalEstoque['origem']; rotulo: string }[] = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'produto', rotulo: 'Produtos' },
  { valor: 'medicamento', rotulo: 'Medicamentos' },
  { valor: 'insumo', rotulo: 'Insumos' },
];

const sxBotaoCadastro = {
  textTransform: 'none' as const,
  fontWeight: 700,
  color: '#f8fafc',
  backgroundColor: '#2563eb',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#1d4ed8',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 20px rgba(29, 78, 216, 0.35)',
  },
  '& .MuiButton-startIcon': { color: '#e2e8f0' },
};

const contagemInicial: ContagemPorClasse = { produtos: 0, medicamentos: 0, insumos: 0 };

export function DashboardPage() {
  const navigate = useNavigate();
  const { usuario, sair } = useAutenticacao();
  const papelUsuario = mapearPapelUsuario(usuario?.permissao);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [contagemPorOrigem, setContagemPorOrigem] = useState<ContagemPorClasse>(contagemInicial);
  const [totalItens, setTotalItens] = useState(0);
  const [linhasOperacionais, setLinhasOperacionais] = useState<LinhaOperacionalEstoque[]>([]);
  const [drawerAbertoMobile, setDrawerAbertoMobile] = useState(false);
  const [emTransicao, setEmTransicao] = useState(false);
  const [categoria, setCategoria] = useState<'' | LinhaOperacionalEstoque['origem']>('');
  const [busca, setBusca] = useState('');
  const [debouncedBusca, setDebouncedBusca] = useState('');
  const [pageMinimo, setPageMinimo] = useState(1);
  const [pageVencimento, setPageVencimento] = useState(1);
  const theme = useTheme();
  const ehMobileLayoutConteudo = useMediaQuery(theme.breakpoints.down('sm'));
  const ehMobileMenu = useMediaQuery(theme.breakpoints.down('md'));
  const itensPorPaginaAlertas = ehMobileLayoutConteudo ? 3 : 5;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedBusca(busca);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    setPageMinimo(1);
    setPageVencimento(1);
  }, [categoria, debouncedBusca]);

  useEffect(() => {
    let ativo = true;

    async function carregarResumo() {
      setCarregando(true);
      setErroCarregamento(null);
      try {
        const [produtos, medicamentos, insumos] = await Promise.all([
          listarProdutosApi(),
          listarMedicamentosApi(),
          listarInsumosApi(),
        ]);
        if (!ativo) return;
        setContagemPorOrigem({
          produtos: produtos.length,
          medicamentos: medicamentos.length,
          insumos: insumos.length,
        });
        setTotalItens(produtos.length + medicamentos.length + insumos.length);

        const hoje = new Date();
        const limiteVencimento = new Date();
        limiteVencimento.setDate(hoje.getDate() + 30);

        const itensComOrigem = [
          ...produtos.map((item) => ({ ...item, origem: 'produto' as const })),
          ...medicamentos.map((item) => ({ ...item, origem: 'medicamento' as const })),
          ...insumos.map((item) => ({ ...item, origem: 'insumo' as const })),
        ];

        const itens = itensComOrigem.map((item) => {
          const quantidadeAtual = item.itensEstoque.reduce((acc, lote) => acc + lote.quantidade, 0);
          const minimo = item.itemNivelEstoque?.nivelMinimoEstoque ?? 0;
          const temValidadeProxima = item.itensEstoque.some((lote) => {
            if (!lote.dataValidade) return false;
            const validade = new Date(lote.dataValidade);
            if (Number.isNaN(validade.getTime())) return false;
            return validade >= hoje && validade <= limiteVencimento;
          });
          const maiorDataMovimentacao = item.itensEstoque
            .map((lote) => new Date(lote.dataEntrega))
            .filter((data) => !Number.isNaN(data.getTime()))
            .sort((a, b) => b.getTime() - a.getTime())[0];
          const menorValidade = item.itensEstoque
            .map((lote) => (lote.dataValidade ? new Date(lote.dataValidade) : null))
            .filter((data): data is Date => data !== null && !Number.isNaN(data.getTime()))
            .sort((a, b) => a.getTime() - b.getTime())[0];

          let status: LinhaOperacionalEstoque['status'] = 'ok';
          if (quantidadeAtual <= 0) status = 'critico';
          else if (temValidadeProxima) status = 'proximo_vencimento';
          else if (quantidadeAtual < minimo) status = 'baixo';

          return {
            id: item.idItem,
            nome: item.nomeItem,
            quantidade: quantidadeAtual,
            minimo,
            validade: menorValidade ? menorValidade.toLocaleDateString('pt-BR') : 'Sem validade',
            origem: item.origem,
            status,
            ultimaMovimentacao: maiorDataMovimentacao
              ? maiorDataMovimentacao.toLocaleDateString('pt-BR')
              : 'Sem movimentacao',
            validadeMs: menorValidade ? menorValidade.getTime() : null,
            movimentacaoMs: maiorDataMovimentacao ? maiorDataMovimentacao.getTime() : null,
          } satisfies LinhaOperacionalEstoque;
        });

        if (!ativo) return;
        setLinhasOperacionais(itens);
      } catch {
        if (!ativo) return;
        setErroCarregamento('Nao foi possivel carregar os estoques atuais do backend.');
        setContagemPorOrigem(contagemInicial);
        setTotalItens(0);
        setLinhasOperacionais([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarResumo();
    return () => {
      ativo = false;
    };
  }, []);

  function navegarComTransicao(rota: string) {
    setEmTransicao(true);
    window.setTimeout(() => {
      navigate(rota);
      setEmTransicao(false);
    }, 160);
  }

  function navegarParaDetalhe(item: LinhaOperacionalEstoque) {
    if (item.origem === 'produto') navigate(`/produtos/${item.id}`);
    else if (item.origem === 'medicamento') navigate(`/medicamentos/${item.id}`);
    else navigate(`/insumos/${item.id}`);
  }

  const itensAbaixoMinimo = useMemo(
    () => linhasOperacionais.filter((item) => item.quantidade < item.minimo),
    [linhasOperacionais],
  );
  const itensProximoVencimento = useMemo(
    () => linhasOperacionais.filter((item) => item.status === 'proximo_vencimento'),
    [linhasOperacionais],
  );

  const aplicarFiltrosAlertas = useMemo(() => {
    const trecho = debouncedBusca.trim().toLowerCase();
    return (lista: LinhaOperacionalEstoque[]) =>
      lista.filter((item) => {
        const matchCategoria = !categoria || item.origem === categoria;
        const matchBusca = !trecho || item.nome.toLowerCase().includes(trecho);
        return matchCategoria && matchBusca;
      });
  }, [categoria, debouncedBusca]);

  const listaFiltradaMinimo = useMemo(
    () => aplicarFiltrosAlertas(itensAbaixoMinimo),
    [aplicarFiltrosAlertas, itensAbaixoMinimo],
  );

  const listaFiltradaVencimento = useMemo(
    () => aplicarFiltrosAlertas(itensProximoVencimento),
    [aplicarFiltrosAlertas, itensProximoVencimento],
  );

  const rotuloVazioMinimo = useMemo(() => {
    if (itensAbaixoMinimo.length === 0) return 'Nenhum item abaixo do nível mínimo no momento.';
    if (debouncedBusca.trim()) return 'Nenhum item corresponde à busca.';
    if (categoria) return 'Nenhum item desta categoria abaixo do mínimo.';
    return 'Nenhum item abaixo do nível mínimo no momento.';
  }, [itensAbaixoMinimo.length, debouncedBusca, categoria]);

  const rotuloVazioVencimento = useMemo(() => {
    if (itensProximoVencimento.length === 0) return 'Nenhum item próximo do vencimento no momento.';
    if (debouncedBusca.trim()) return 'Nenhum item corresponde à busca.';
    if (categoria) return 'Nenhum item desta categoria próximo do vencimento.';
    return 'Nenhum item próximo do vencimento no momento.';
  }, [itensProximoVencimento.length, debouncedBusca, categoria]);

  const totalPagesMinimo = useMemo(
    () =>
      listaFiltradaMinimo.length === 0
        ? 1
        : Math.ceil(listaFiltradaMinimo.length / itensPorPaginaAlertas),
    [listaFiltradaMinimo.length, itensPorPaginaAlertas],
  );

  const totalPagesVencimento = useMemo(
    () =>
      listaFiltradaVencimento.length === 0
        ? 1
        : Math.ceil(listaFiltradaVencimento.length / itensPorPaginaAlertas),
    [listaFiltradaVencimento.length, itensPorPaginaAlertas],
  );

  const paginaSeguraMinimo = Math.min(Math.max(1, pageMinimo), totalPagesMinimo);
  const paginaSeguraVencimento = Math.min(Math.max(1, pageVencimento), totalPagesVencimento);

  const listaPaginadaMinimo = useMemo(() => {
    const start = (paginaSeguraMinimo - 1) * itensPorPaginaAlertas;
    return listaFiltradaMinimo.slice(start, start + itensPorPaginaAlertas);
  }, [listaFiltradaMinimo, paginaSeguraMinimo, itensPorPaginaAlertas]);

  const listaPaginadaVencimento = useMemo(() => {
    const start = (paginaSeguraVencimento - 1) * itensPorPaginaAlertas;
    return listaFiltradaVencimento.slice(start, start + itensPorPaginaAlertas);
  }, [listaFiltradaVencimento, paginaSeguraVencimento, itensPorPaginaAlertas]);

  useEffect(() => {
    if (paginaSeguraMinimo !== pageMinimo) {
      setPageMinimo(paginaSeguraMinimo);
    }
  }, [paginaSeguraMinimo, pageMinimo]);

  useEffect(() => {
    if (paginaSeguraVencimento !== pageVencimento) {
      setPageVencimento(paginaSeguraVencimento);
    }
  }, [paginaSeguraVencimento, pageVencimento]);

  return (
    <ThemeProvider theme={temaDashboard}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#020617' }}>
        <SidebarEstoque
          abertoMobile={drawerAbertoMobile}
          aoFecharMobile={() => setDrawerAbertoMobile(false)}
          ehMobile={ehMobileMenu}
          papelUsuario={papelUsuario}
        />
        <Box
          sx={{
            flex: 1,
            px: { xs: SPACING.sm, sm: SPACING.md, md: SPACING.lg },
            pt: SPACING.sm,
            pb: SPACING.lg,
            borderLeft: { md: '1px solid rgba(148, 163, 184, 0.12)' },
            backgroundColor: '#040b1f',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: SPACING.md }}>
            {ehMobileMenu ? (
              <IconButton color="inherit" onClick={() => setDrawerAbertoMobile(true)} sx={{ color: '#e2e8f0' }}>
                <MenuOutlinedIcon />
              </IconButton>
            ) : (
              <Box />
            )}
            <Button
              variant="outlined"
              color="inherit"
              sx={{ borderColor: 'rgba(148,163,184,0.35)', color: '#e2e8f0' }}
              onClick={() => {
                sair();
                navigate('/login');
              }}
            >
              Sair
            </Button>
          </Stack>

          <Box sx={{ mb: SPACING.md }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
              Ola, {usuario?.primeiroNome ?? 'equipe'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)' }}>
              {ehMobileLayoutConteudo ? 'Operação de estoque' : 'Busca guiada e visão rápida do estoque'}
            </Typography>
          </Box>

          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: emTransicao ? 0.7 : 1, y: 0 }}
            transition={{ duration: 0.32 }}
            sx={{ mt: SPACING.sm }}
          >
            <Stack spacing={SPACING.lg} sx={{ p: 0 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0', mb: SPACING.sm }}>
                  Acoes principais
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={SPACING.sm}>
                  <Button
                    variant="contained"
                    startIcon={<Inventory2OutlinedIcon />}
                    onClick={() => navegarComTransicao('/produtos/novo')}
                    fullWidth
                    sx={sxBotaoCadastro}
                  >
                    Cadastrar Produtos
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<MedicalServicesOutlinedIcon />}
                    onClick={() => navegarComTransicao('/medicamentos/novo')}
                    fullWidth
                    sx={sxBotaoCadastro}
                  >
                    Cadastrar Medicamentos
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ScienceOutlinedIcon />}
                    onClick={() => navegarComTransicao('/insumos/novo')}
                    fullWidth
                    sx={sxBotaoCadastro}
                  >
                    Cadastrar Insumos
                  </Button>
                </Stack>
              </Box>

              <BuscaCategoriaTabs itens={linhasOperacionais} onSelecionarItem={navegarParaDetalhe} />

              {erroCarregamento && <Alert severity="error">{erroCarregamento}</Alert>}

              <Box>
                <ResumoItensCadastrados
                  carregando={carregando}
                  totalItens={totalItens}
                  contagemPorOrigem={contagemPorOrigem}
                />
              </Box>

              {!erroCarregamento && (
                <Stack spacing={SPACING.md}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e2e8f0', mb: 1 }}>
                      Alertas do estoque
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        flexWrap: 'wrap',
                        gap: 2,
                        alignItems: { xs: 'stretch', sm: 'center' },
                        mb: 2,
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="Buscar item..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        fullWidth
                        slotProps={{ htmlInput: { 'aria-label': 'Buscar nos alertas do estoque' } }}
                        sx={{
                          flex: { sm: '1 1 200px' },
                          maxWidth: { sm: 360 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            color: '#e2e8f0',
                            backgroundColor: 'rgba(2, 6, 23, 0.45)',
                            '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
                            '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.55)' },
                            '&.Mui-focused fieldset': { borderColor: 'rgba(96, 165, 250, 0.8)' },
                          },
                          '& .MuiInputBase-input::placeholder': { color: 'rgba(148, 163, 184, 0.85)', opacity: 1 },
                        }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                          flex: { sm: '1 1 auto' },
                        }}
                      >
                        {CHIPS_CATEGORIA_ALERTAS.map(({ valor, rotulo }) => (
                          <Chip
                            key={valor || 'todos'}
                            label={rotulo}
                            size="small"
                            clickable
                            color={categoria === valor ? 'primary' : 'default'}
                            variant={categoria === valor ? 'filled' : 'outlined'}
                            onClick={() => setCategoria(valor)}
                            sx={{
                              fontWeight: 600,
                              ...(categoria !== valor && {
                                color: '#e2e8f0',
                                borderColor: 'rgba(148, 163, 184, 0.4)',
                                bgcolor: 'rgba(15, 23, 42, 0.5)',
                              }),
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.9)', display: 'block' }}>
                      {listaFiltradaMinimo.length} abaixo do mínimo · {listaFiltradaVencimento.length} próx. do
                      vencimento
                    </Typography>
                  </Box>
                  <Grid container spacing={SPACING.md}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <AlertaCard
                        variante="abaixo_minimo"
                        titulo="Itens abaixo do mínimo"
                        descricao="Itens com quantidade abaixo do mínimo cadastrado."
                        itens={listaPaginadaMinimo}
                        totalFiltrado={listaFiltradaMinimo.length}
                        page={paginaSeguraMinimo}
                        totalPages={totalPagesMinimo}
                        onPageChange={setPageMinimo}
                        isMobile={ehMobileLayoutConteudo}
                        carregando={carregando}
                        vazioLabel={rotuloVazioMinimo}
                        onItemClick={navegarParaDetalhe}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <AlertaCard
                        variante="proximo_vencimento"
                        titulo="Próximo do vencimento"
                        descricao="Itens com validade em até 30 dias."
                        itens={listaPaginadaVencimento}
                        totalFiltrado={listaFiltradaVencimento.length}
                        page={paginaSeguraVencimento}
                        totalPages={totalPagesVencimento}
                        onPageChange={setPageVencimento}
                        isMobile={ehMobileLayoutConteudo}
                        carregando={carregando}
                        vazioLabel={rotuloVazioVencimento}
                        onItemClick={navegarParaDetalhe}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              )}
            </Stack>
          </MotionBox>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
