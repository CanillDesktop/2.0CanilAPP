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
import { listarTodosInsumosParaEstoqueApi } from '../../insumos/api/insumosApi';
import { listarTodosMedicamentosParaEstoqueApi } from '../../medicamentos/api/medicamentosApi';
import { listarTodosProdutosParaEstoqueApi } from '../../produtos/api/produtosApi';
import { EstoqueGestaoConteudo } from '../components/EstoqueGestaoConteudo';
import { PainelFiltrosEstoque } from '../components/PainelFiltrosEstoque';
import { useListaEstoqueProcessada, type CampoOrdenacaoEstoque } from '../hooks/useListaEstoqueProcessada';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

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
  const [abaTipo, setAbaTipo] = useState(lerAbaEstoqueSalva);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [linhasOperacionais, setLinhasOperacionais] = useState<LinhaOperacionalEstoque[]>([]);

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
          listarTodosProdutosParaEstoqueApi(),
          listarTodosMedicamentosParaEstoqueApi(),
          listarTodosInsumosParaEstoqueApi(),
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
              : 'Sem movimentação',
            validadeMs: menorValidade ? menorValidade.getTime() : null,
            movimentacaoMs: maiorDataMovimentacao ? maiorDataMovimentacao.getTime() : null,
          } satisfies LinhaOperacionalEstoque;
        });

        if (!ativo) return;
        setLinhasOperacionais(itens);
      } catch {
        if (!ativo) return;
        setErroCarregamento(MSG_ERRO.carregarEstoque);
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

  const { dadosPaginados, totalFiltrado, paginaSegura } = useListaEstoqueProcessada(
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
              dadosPaginados={dadosPaginados}
              totalFiltrado={totalFiltrado}
              page={paginaSegura}
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
