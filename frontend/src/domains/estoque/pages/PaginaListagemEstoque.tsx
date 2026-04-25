import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  CssBaseline,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  TextField,
  createTheme,
  useMediaQuery,
  useTheme,
  ThemeProvider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState, type FormEvent, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { listarInsumosApi } from '../../insumos/api/insumosApi';
import { listarMedicamentosApi } from '../../medicamentos/api/medicamentosApi';
import { listarProdutosApi } from '../../produtos/api/produtosApi';
import { DataTableEstoque, type LinhaOperacionalEstoque } from '../components/DataTableEstoque';
import { KpiCard } from '../components/KpiCard';
import { QuickActions, type AcaoRapida } from '../components/QuickActions';
import { SidebarEstoque } from '../components/SidebarEstoque';

const temaDashboard = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f172a',
      paper: '#111827',
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

const CHAVE_ABA_ESTOQUE = 'canipapp_estoque_aba_tipo';

function lerAbaEstoqueSalva(): number {
  try {
    const raw = localStorage.getItem(CHAVE_ABA_ESTOQUE);
    const n = raw === null ? NaN : Number(raw);
    if (n === 0 || n === 1 || n === 2) return n;
  } catch {
    /* ignore */
  }
  return 0;
}

export function PaginaListagemEstoque() {
  const navigate = useNavigate();
  const { usuario, sair } = useAutenticacao();
  const [filtroNome, setFiltroNome] = useState('');
  const [abaTipo, setAbaTipo] = useState(lerAbaEstoqueSalva);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [linhasOperacionais, setLinhasOperacionais] = useState<LinhaOperacionalEstoque[]>([]);
  const [produtosAVencer, setProdutosAVencer] = useState(0);
  const [drawerAbertoMobile, setDrawerAbertoMobile] = useState(false);
  const [emTransicao, setEmTransicao] = useState(false);
  const theme = useTheme();
  const ehMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    let ativo = true;

    async function carregarDashboard() {
      setCarregando(true);
      setErroCarregamento(null);
      try {
        const [produtos, medicamentos, insumos] = await Promise.all([
          listarProdutosApi(),
          listarMedicamentosApi(),
          listarInsumosApi(),
        ]);

        const hoje = new Date();
        const limiteVencimento = new Date();
        limiteVencimento.setDate(hoje.getDate() + 30);

        const itensComOrigem = [
          ...produtos.map((item) => ({ ...item, origem: 'produto' as const })),
          ...medicamentos.map((item) => ({ ...item, origem: 'medicamento' as const })),
          ...insumos.map((item) => ({ ...item, origem: 'insumo' as const })),
        ];

        const idsComVencimentoProximo = new Set<number>();
        itensComOrigem.forEach((item) => {
          item.itensEstoque.forEach((lote) => {
            if (!lote.dataValidade) return;
            const validade = new Date(lote.dataValidade);
            if (Number.isNaN(validade.getTime())) return;
            if (validade >= hoje && validade <= limiteVencimento) {
              idsComVencimentoProximo.add(item.idItem);
            }
          });
        });

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

          let status: LinhaOperacionalEstoque['status'] = 'ok';
          if (quantidadeAtual <= 0) status = 'critico';
          else if (temValidadeProxima) status = 'proximo_vencimento';
          else if (quantidadeAtual < minimo) status = 'baixo';

          return {
            id: item.idItem,
            nome: item.nomeItem,
            quantidade: quantidadeAtual,
            minimo,
            origem: item.origem,
            status,
            ultimaMovimentacao: maiorDataMovimentacao
              ? maiorDataMovimentacao.toLocaleDateString('pt-BR')
              : 'Sem movimentacao',
          } satisfies LinhaOperacionalEstoque;
        });

        if (!ativo) return;
        setLinhasOperacionais(itens);
        setProdutosAVencer(idsComVencimentoProximo.size);
      } catch {
        if (!ativo) return;
        setErroCarregamento('Nao foi possivel carregar os estoques atuais do backend.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarDashboard();
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

  function aoConsultar(e: FormEvent) {
    e.preventDefault();
  }

  function aoMudarAba(_event: SyntheticEvent, novoValor: number) {
    setAbaTipo(novoValor);
    try {
      localStorage.setItem(CHAVE_ABA_ESTOQUE, String(novoValor));
    } catch {
      /* ignore */
    }
  }

  function navegarParaDetalhe(item: LinhaOperacionalEstoque) {
    if (item.origem === 'produto') navigate(`/produtos/${item.id}`);
    else if (item.origem === 'medicamento') navigate(`/medicamentos/${item.id}`);
    else navigate(`/insumos/${item.id}`);
  }

  function rotuloTipoItem(origem: LinhaOperacionalEstoque['origem']) {
    if (origem === 'produto') return 'Produto';
    if (origem === 'medicamento') return 'Medicamento';
    return 'Insumo';
  }

  const totalBaixoEstoque = linhasOperacionais.filter((item) => item.quantidade < item.minimo).length;
  const itensAbaixoMinimo = linhasOperacionais.filter((item) => item.quantidade < item.minimo);

  const contagemPorOrigem = useMemo(() => {
    let produtos = 0;
    let medicamentos = 0;
    let insumos = 0;
    for (const linha of linhasOperacionais) {
      if (linha.origem === 'produto') produtos += 1;
      else if (linha.origem === 'medicamento') medicamentos += 1;
      else insumos += 1;
    }
    return { produtos, medicamentos, insumos };
  }, [linhasOperacionais]);

  const linhasFiltradas = useMemo(() => {
    const origemAlvo =
      abaTipo === 0 ? 'produto' : abaTipo === 1 ? 'medicamento' : ('insumo' as const);
    let lista = linhasOperacionais.filter((item) => item.origem === origemAlvo);
    const termo = filtroNome.trim().toLowerCase();
    if (termo) {
      lista = lista.filter((item) => item.nome.toLowerCase().includes(termo));
    }
    return lista;
  }, [linhasOperacionais, abaTipo, filtroNome]);

  const acoesRapidas: AcaoRapida[] = [
    {
      id: 'cadastrar-produto',
      titulo: 'Cadastrar Produto',
      descricao: 'Abrir formulario de cadastro',
      icone: 'produto',
      onClick: () => navegarComTransicao('/produtos/novo'),
    },
    {
      id: 'entrada-estoque',
      titulo: 'Entrada de Estoque',
      descricao: 'Registrar novo lote',
      icone: 'entrada',
      onClick: () => navegarComTransicao('/estoque/lotes/novo'),
    },
    {
      id: 'saida-estoque',
      titulo: 'Saida de Estoque',
      descricao: 'Registrar retirada',
      icone: 'saida',
      onClick: () => navegarComTransicao('/estoque/retirada'),
    },
  ];

  return (
    <ThemeProvider theme={temaDashboard}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
        <SidebarEstoque
          abertoMobile={drawerAbertoMobile}
          aoFecharMobile={() => setDrawerAbertoMobile(false)}
          ehMobile={ehMobile}
        />
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            pt: 2,
            pb: 4,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            {ehMobile ? (
              <IconButton color="inherit" onClick={() => setDrawerAbertoMobile(true)}>
                <MenuOutlinedIcon />
              </IconButton>
            ) : (
              <Box />
            )}
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                sair();
                navigate('/login');
              }}
            >
              Sair
            </Button>
          </Stack>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Ola, {usuario?.primeiroNome ?? 'equipe'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estoque em tempo real
            </Typography>
          </Box>

          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: emTransicao ? 0.7 : 1, y: 0 }}
            transition={{ duration: 0.32 }}
            sx={{ mt: 1 }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KpiCard
                  titulo="Total de Produtos"
                  valor={String(linhasOperacionais.length)}
                  icone={<WarehouseOutlinedIcon />}
                  cor="primary"
                  carregando={carregando}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KpiCard
                  titulo="Baixo Estoque"
                  valor={String(totalBaixoEstoque)}
                  icone={<ReportProblemOutlinedIcon />}
                  cor="warning"
                  carregando={carregando}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KpiCard
                  titulo="Produtos a Vencer (< 30 dias)"
                  valor={String(produtosAVencer)}
                  icone={<SwapHorizOutlinedIcon />}
                  cor="success"
                  carregando={carregando}
                />
              </Grid>

              <Grid size={12}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Acoes rapidas
                </Typography>
                <QuickActions acoes={acoesRapidas} />
              </Grid>

              <Grid size={12}>
                {erroCarregamento ? (
                  <Alert severity="error">{erroCarregamento}</Alert>
                ) : (
                  <Paper
                    sx={{
                      borderRadius: 3,
                      p: { xs: 2, sm: 2.5 },
                      backgroundImage: 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack spacing={0.75}>
                        <Stack
                          direction="row"
                          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                            Abaixo do nível mínimo
                          </Typography>
                          <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                              borderColor: 'rgba(251, 191, 36, 0.55)',
                              color: '#fde68a',
                            }}
                            label={
                              carregando
                                ? '...'
                                : itensAbaixoMinimo.length === 0
                                  ? 'Nenhum alerta'
                                  : itensAbaixoMinimo.length === 1
                                    ? '1 item'
                                    : `${itensAbaixoMinimo.length} itens`
                            }
                          />
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.9)', maxWidth: 720 }}>
                          Lista dos itens com estoque abaixo do mínimo cadastrado. Toque em um card para abrir o
                          cadastro.
                        </Typography>
                      </Stack>
                      {carregando ? (
                        <Typography variant="body2" color="text.secondary">
                          Carregando alertas...
                        </Typography>
                      ) : itensAbaixoMinimo.length ? (
                        <Stack sx={{ gap: 1.25 }}>
                          {itensAbaixoMinimo.slice(0, 8).map((item) => {
                            const pct =
                              item.minimo > 0
                                ? Math.min(100, Math.round((item.quantidade / item.minimo) * 100))
                                : 0;
                            return (
                              <Box
                                key={`${item.origem}-${item.id}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => navegarParaDetalhe(item)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navegarParaDetalhe(item);
                                  }
                                }}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '1px solid rgba(71, 85, 105, 0.45)',
                                  bgcolor: 'rgba(2, 6, 23, 0.55)',
                                  transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
                                  '&:hover': {
                                    borderColor: 'rgba(251, 191, 36, 0.45)',
                                    bgcolor: 'rgba(15, 23, 42, 0.85)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                                  },
                                  '&:focus-visible': {
                                    outline: '2px solid #38bdf8',
                                    outlineOffset: 2,
                                  },
                                }}
                              >
                                <Stack
                                  direction="row"
                                  sx={{
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: 1.5,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontWeight: 700, color: '#f8fafc', lineHeight: 1.35 }}
                                    >
                                      {item.nome}
                                    </Typography>
                                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                                      <Chip
                                        label={rotuloTipoItem(item.origem)}
                                        size="small"
                                        sx={{
                                          height: 24,
                                          fontWeight: 600,
                                          bgcolor: 'rgba(51, 65, 85, 0.6)',
                                          color: '#e2e8f0',
                                          border: '1px solid rgba(148, 163, 184, 0.25)',
                                        }}
                                      />
                                    </Stack>
                                  </Stack>
                                  <Stack
                                    direction="row"
                                    spacing={1.25}
                                    sx={{ alignItems: 'center', flexShrink: 0 }}
                                  >
                                    <Stack sx={{ alignItems: 'flex-end', minWidth: 120 }}>
                                      <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)' }}>
                                        Atual / mínimo
                                      </Typography>
                                      <Typography
                                        variant="h6"
                                        component="p"
                                        sx={{ fontWeight: 800, color: '#fbbf24', m: 0, lineHeight: 1.2 }}
                                      >
                                        {item.quantidade}
                                        <Typography
                                          component="span"
                                          variant="body2"
                                          sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 600, mx: 0.5 }}
                                        >
                                          /
                                        </Typography>
                                        <Typography
                                          component="span"
                                          variant="h6"
                                          sx={{ fontWeight: 700, color: '#e2e8f0' }}
                                        >
                                          {item.minimo}
                                        </Typography>
                                      </Typography>
                                    </Stack>
                                    <ChevronRightRoundedIcon sx={{ color: 'rgba(148, 163, 184, 0.7)', mt: 0.25 }} />
                                  </Stack>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={pct}
                                  color="warning"
                                  sx={{
                                    mt: 1.5,
                                    height: 6,
                                    borderRadius: 999,
                                    bgcolor: 'rgba(30, 41, 59, 0.9)',
                                    '& .MuiLinearProgress-bar': { borderRadius: 999 },
                                  }}
                                />
                              </Box>
                            );
                          })}
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'rgba(52, 211, 153, 0.95)' }}>
                          Nenhum item abaixo do nível mínimo no momento.
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Grid>

              <Grid size={12}>
                <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', mb: 1.4, gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Estoque
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={aoConsultar}
                    sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <TextField
                      value={filtroNome}
                      onChange={(e) => setFiltroNome(e.target.value)}
                      placeholder="Consultar item por nome"
                      size="small"
                      sx={{
                        minWidth: 220,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Button type="submit" variant="contained">
                      Consultar
                    </Button>
                  </Box>
                </Stack>
                <Tabs
                  value={abaTipo}
                  onChange={aoMudarAba}
                  textColor="inherit"
                  indicatorColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    mb: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    '& .MuiTab-root': { color: 'rgba(226,232,240,0.72)' },
                    '& .Mui-selected': { color: '#e2e8f0' },
                  }}
                >
                  <Tab
                    label={`Produtos (${contagemPorOrigem.produtos})`}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  />
                  <Tab
                    label={`Medicamentos (${contagemPorOrigem.medicamentos})`}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  />
                  <Tab
                    label={`Insumos (${contagemPorOrigem.insumos})`}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  />
                </Tabs>
                <DataTableEstoque
                  linhas={linhasFiltradas}
                  carregando={carregando}
                  aoClicarItem={navegarParaDetalhe}
                />
              </Grid>
            </Grid>
          </MotionBox>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
