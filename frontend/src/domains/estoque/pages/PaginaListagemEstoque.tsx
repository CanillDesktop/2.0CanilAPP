import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import {
  Box,
  Button,
  Card,
  CssBaseline,
  IconButton,
  Stack,
  Tab,
  Tabs,
  ThemeProvider,
  Typography,
  createTheme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { mapearPapelUsuario } from '../../../shared/types/papelUsuario';
import { listarInsumosApi } from '../../insumos/api/insumosApi';
import { listarMedicamentosApi } from '../../medicamentos/api/medicamentosApi';
import { listarProdutosApi } from '../../produtos/api/produtosApi';
import { EstoqueGestaoConteudo } from '../components/EstoqueGestaoConteudo';
import { PainelFiltrosEstoque } from '../components/PainelFiltrosEstoque';
import { SidebarEstoque } from '../components/SidebarEstoque';
import { useListaEstoqueProcessada, type CampoOrdenacaoEstoque } from '../hooks/useListaEstoqueProcessada';
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
  const { usuario } = useAutenticacao();
  const papelUsuario = mapearPapelUsuario(usuario?.permissao);
  const [abaTipo, setAbaTipo] = useState(lerAbaEstoqueSalva);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [linhasOperacionais, setLinhasOperacionais] = useState<LinhaOperacionalEstoque[]>([]);
  const [drawerAbertoMobile, setDrawerAbertoMobile] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'' | LinhaOperacionalEstoque['status']>('');
  const [qtdMin, setQtdMin] = useState('');
  const [qtdMax, setQtdMax] = useState('');
  const [validadeDe, setValidadeDe] = useState('');
  const [validadeAte, setValidadeAte] = useState('');
  const [movDe, setMovDe] = useState('');
  const [movAte, setMovAte] = useState('');

  const [orderBy, setOrderBy] = useState<CampoOrdenacaoEstoque>('nome');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const ehMobileMenu = useMediaQuery(theme.breakpoints.down('md'));

  const rowsPerPage = isMobile ? 5 : 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErroCarregamento(null);
      try {
        const [produtos, medicamentos, insumos] = await Promise.all([
          listarProdutosApi(undefined, { pageNumber: 1, pageSize: 50 }),
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
            id: item.id,
            nome: item.nomeOuDescricaoSimples,
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
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarDados();
    return () => {
      ativo = false;
    };
  }, []);

  const origemAlvo: LinhaOperacionalEstoque['origem'] =
    abaTipo === 0 ? 'produto' : abaTipo === 1 ? 'medicamento' : 'insumo';

  const opcoesProcessamento = useMemo(
    () => ({
      origemAlvo,
      debouncedSearch,
      statusFiltro,
      qtdMin,
      qtdMax,
      validadeDe,
      validadeAte,
      movDe,
      movAte,
      orderBy,
      orderDirection,
      page,
      rowsPerPage,
    }),
    [
      origemAlvo,
      debouncedSearch,
      statusFiltro,
      qtdMin,
      qtdMax,
      validadeDe,
      validadeAte,
      movDe,
      movAte,
      orderBy,
      orderDirection,
      page,
      rowsPerPage,
    ],
  );

  const { dadosPaginados, totalFiltrado, totalPages, paginaSegura } = useListaEstoqueProcessada(
    linhasOperacionais,
    opcoesProcessamento,
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFiltro, qtdMin, qtdMax, validadeDe, validadeAte, movDe, movAte, abaTipo]);

  useEffect(() => {
    if (paginaSegura !== page) {
      setPage(paginaSegura);
    }
  }, [paginaSegura, page]);

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

  const filtrosAtivos = useMemo(
    () =>
      Boolean(
        statusFiltro ||
          qtdMin ||
          qtdMax ||
          validadeDe ||
          validadeAte ||
          movDe ||
          movAte ||
          debouncedSearch.trim(),
      ),
    [statusFiltro, qtdMin, qtdMax, validadeDe, validadeAte, movDe, movAte, debouncedSearch],
  );

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

  function handleSort(field: CampoOrdenacaoEstoque) {
    if (orderBy === field) {
      setOrderDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(field);
      setOrderDirection('asc');
    }
  }

  function limparFiltros() {
    setSearch('');
    setDebouncedSearch('');
    setStatusFiltro('');
    setQtdMin('');
    setQtdMax('');
    setValidadeDe('');
    setValidadeAte('');
    setMovDe('');
    setMovAte('');
    setPage(1);
  }

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
            px: { xs: 2, sm: 3, md: 4 },
            pt: 2,
            pb: 4,
            borderLeft: { md: '1px solid rgba(148, 163, 184, 0.12)' },
            backgroundColor: '#040b1f',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            {ehMobileMenu ? (
              <IconButton color="inherit" onClick={() => setDrawerAbertoMobile(true)} sx={{ color: '#e2e8f0' }}>
                <MenuOutlinedIcon />
              </IconButton>
            ) : (
              <Box />
            )}
            <Button
              variant="outlined"
              sx={{ borderColor: 'rgba(148,163,184,0.35)', color: '#e2e8f0' }}
              onClick={() => navigate('/dashboard')}
            >
              Voltar ao inicio
            </Button>
          </Stack>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#e2e8f0' }}>
              Gestão de estoque
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)' }}>
              Filtros, ordenação e paginação — {usuario?.primeiroNome ?? 'equipe'}
            </Typography>
          </Box>

          <Tabs
            value={abaTipo}
            onChange={aoMudarAba}
            textColor="inherit"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              '& .MuiTab-root': { color: 'rgba(226,232,240,0.72)' },
              '& .Mui-selected': { color: '#e2e8f0' },
            }}
          >
            <Tab label={`Produtos (${contagemPorOrigem.produtos})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab
              label={`Medicamentos (${contagemPorOrigem.medicamentos})`}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab label={`Insumos (${contagemPorOrigem.insumos})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

          <Stack spacing={3}>
            <Card
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: '#0f172a',
                border: '1px solid rgba(148, 163, 184, 0.12)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#e2e8f0', mb: 2 }}>
                Filtros
              </Typography>
              <PainelFiltrosEstoque
                isMobile={isMobile}
                search={search}
                onSearchChange={setSearch}
                statusFiltro={statusFiltro}
                onStatusChange={setStatusFiltro}
                qtdMin={qtdMin}
                onQtdMinChange={setQtdMin}
                qtdMax={qtdMax}
                onQtdMaxChange={setQtdMax}
                validadeDe={validadeDe}
                onValidadeDeChange={setValidadeDe}
                validadeAte={validadeAte}
                onValidadeAteChange={setValidadeAte}
                movDe={movDe}
                onMovDeChange={setMovDe}
                movAte={movAte}
                onMovAteChange={setMovAte}
                onLimpar={limparFiltros}
                filtrosAtivos={filtrosAtivos}
              />
            </Card>

            {erroCarregamento ? (
              <Typography variant="body2" color="error">
                {erroCarregamento}
              </Typography>
            ) : null}

            <EstoqueGestaoConteudo
              isMobile={isMobile}
              carregando={carregando}
              dadosPaginados={dadosPaginados}
              totalFiltrado={totalFiltrado}
              page={paginaSegura}
              totalPages={totalPages}
              onPageChange={setPage}
              orderBy={orderBy}
              orderDirection={orderDirection}
              onSort={handleSort}
              onRowClick={navegarParaDetalhe}
            />
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
