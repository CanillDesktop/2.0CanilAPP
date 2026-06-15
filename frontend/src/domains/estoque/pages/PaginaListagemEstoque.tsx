import {
  Alert,
  Box,
  Card,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { larguraConteudoPagina, paddingPaginaShell } from '../../../shared/theme/estilosLayoutPagina';
import { consultarEstoquePaginadoApi, obterContagensEstoqueApi } from '../api/estoqueConsultaApi';
import { EstoqueGestaoConteudo } from '../components/EstoqueGestaoConteudo';
import { PainelFiltrosEstoque } from '../components/PainelFiltrosEstoque';
import {
  ESTOQUE_ORIGEM_API,
  ESTOQUE_ORIGEM_POR_NUMERO,
  type CampoOrdenacaoEstoque,
  type EstoqueContagemPorOrigemDto,
  type EstoqueLinhaDto,
  type LinhaOperacionalEstoque,
} from '../types/tiposEstoque';

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

function paraInteiroOuUndefined(valor: string): number | undefined {
  const t = valor.trim();
  if (t === '') return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/** Converte a linha agregada do backend no formato consumido pela tabela. */
function mapearLinha(dto: EstoqueLinhaDto): LinhaOperacionalEstoque {
  return {
    id: dto.id,
    nome: dto.nome,
    quantidade: dto.quantidade,
    minimo: dto.minimo,
    validade: dto.validade,
    origem: ESTOQUE_ORIGEM_POR_NUMERO[dto.origem] ?? 'produto',
    status: dto.statusOperacional,
    ultimaMovimentacao: dto.ultimaMovimentacao,
    validadeMs: dto.menorValidadeUtc ? new Date(dto.menorValidadeUtc).getTime() : null,
    movimentacaoMs: dto.ultimaMovimentacaoUtc ? new Date(dto.ultimaMovimentacaoUtc).getTime() : null,
  };
}

export function PaginaListagemEstoque() {
  const navigate = useNavigate();
  const { usuario } = useAutenticacao();
  const [abaTipo, setAbaTipo] = useState(lerAbaEstoqueSalva);

  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<LinhaOperacionalEstoque[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [contagemPorOrigem, setContagemPorOrigem] = useState<EstoqueContagemPorOrigemDto>({
    produtos: 0,
    medicamentos: 0,
    insumos: 0,
  });

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
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cores } = useTemaApp();
  const estilos = useEstilosListagem();

  const origemAlvo: LinhaOperacionalEstoque['origem'] =
    abaTipo === 0 ? 'produto' : abaTipo === 1 ? 'medicamento' : 'insumo';

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFiltro, qtdMin, qtdMax, validadeDe, validadeAte, movDe, movAte, abaTipo]);

  useEffect(() => {
    let ativo = true;
    obterContagensEstoqueApi()
      .then((c) => {
        if (ativo) setContagemPorOrigem(c);
      })
      .catch(() => {
        /* contagem é acessória; ignora falha */
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErroCarregamento(null);
      try {
        const resposta = await consultarEstoquePaginadoApi(
          {
            origem: ESTOQUE_ORIGEM_API[origemAlvo],
            termoBusca: debouncedSearch.trim() || undefined,
            statusOperacional: statusFiltro || undefined,
            quantidadeMinima: paraInteiroOuUndefined(qtdMin),
            quantidadeMaxima: paraInteiroOuUndefined(qtdMax),
            validadeDe: validadeDe || undefined,
            validadeAte: validadeAte || undefined,
            movimentacaoDe: movDe || undefined,
            movimentacaoAte: movAte || undefined,
          },
          {
            pageNumber: page,
            pageSize: rowsPerPage,
            orderBy,
            sortDirection: orderDirection,
          },
        );

        if (!ativo) return;
        setLinhas(resposta.items.map(mapearLinha));
        setTotalCount(resposta.totalCount);
        setTotalPages(resposta.totalPages);
      } catch {
        if (!ativo) return;
        setErroCarregamento(MSG_ERRO.carregarEstoque);
        setLinhas([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, [
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
  ]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

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
    setPage(1);
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
    <Box
      sx={{
        ...paddingPaginaShell,
        ...larguraConteudoPagina,
        backgroundColor: cores.bgConteudo,
        minHeight: '100%',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: cores.textPrimary }}>
          Gestão de estoque
        </Typography>
        <Typography variant="body2" sx={{ color: cores.textSecondary }}>
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
            borderBottom: `1px solid ${cores.border}`,
            '& .MuiTab-root': { color: cores.textMuted },
            '& .Mui-selected': { color: cores.textPrimary },
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
            <Card sx={{ ...estilos.cardTabela, p: { xs: 2, sm: 3 } }}>
              <Typography variant="subtitle1" sx={{ ...estilos.titulo, mb: 2 }}>
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
              <Alert severity="error">{erroCarregamento}</Alert>
            ) : null}

            <EstoqueGestaoConteudo
              isMobile={isMobile}
              carregando={carregando}
              dadosPaginados={linhas}
              totalFiltrado={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(n) => {
                setRowsPerPage(n);
                setPage(1);
              }}
              onPageChange={setPage}
              orderBy={orderBy}
              orderDirection={orderDirection}
              onSort={handleSort}
              onRowClick={navegarParaDetalhe}
            />
          </Stack>
    </Box>
  );
}
