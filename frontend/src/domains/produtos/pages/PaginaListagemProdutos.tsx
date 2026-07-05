import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import RemoveShoppingCartOutlinedIcon from '@mui/icons-material/RemoveShoppingCartOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TablePagination,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';
import { useSnackbarRetornoListagem } from '../../../shared/hooks/useSnackbarRetornoListagem';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { UnidadeEstoqueIds } from '../../estoque/constants/unidadesEstoque';
import {
  MENSAGEM_LOTE_INVALIDO_RETIRADA,
  MENSAGEM_PRODUTO_SEM_NOME_RETIRADA,
  montarRetiradaNavegacaoState,
  montarRetiradaQueryString,
} from '../../estoque/utils/retiradaNavegacao';
import { FilterBarProdutos } from '../components/FilterBarProdutos';
import { KpiSectionProdutos } from '../components/KpiSectionProdutos';
import { TabelaProdutos } from '../components/TabelaProdutos';
import { useListaProdutosPaginados } from '../hooks/useProdutos';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import type {
  ProdutoExclusivoUnidadeFiltro,
  ProdutoFiltro,
  ProdutoLeituraDto,
  ProdutoStatusEstoqueFiltro,
  CampoOrdenacaoProduto,
} from '../types/tiposProdutos';
import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';

type AbaListagemProdutos = 'todos' | ProdutoExclusivoUnidadeFiltro;

const MotionBox = motion(Box);

export function PaginaListagemProdutos() {
  const { estado, carregar } = useListaProdutosPaginados();
  const { excluir, carregando: carregandoExclusao } = useMutacaoProduto();
  const { unidadeAtivaId, contexto, definirUnidadeAtiva } = useUnidadeEstoque();
  const { cores } = useTemaApp();
  const navigate = useNavigate();
  const estilos = useEstilosListagem();
  const [busca, setBusca] = useState('');
  const [debouncedBusca, setDebouncedBusca] = useState('');
  const [categoria, setCategoria] = useState<'todas' | string>('todas');
  const [status, setStatus] = useState<ProdutoStatusEstoqueFiltro>('todos');
  const [dataEntrega, setDataEntrega] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [aba, setAba] = useState<AbaListagemProdutos>('todos');
  /** Unidade ativa antes de entrar em "Só na Secretaria/Canil", restaurada em "Unidade atual". */
  const unidadeAntesExclusivoRef = useRef<number | null>(null);
  const [idExclusao, setIdExclusao] = useState<number | null>(null);
  const { snackbar, setSnackbar } = useSnackbarRetornoListagem({
    open: false,
    mensagem: '',
    tipo: 'success',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<CampoOrdenacaoProduto>('nome');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');

  const temAcessoDuasUnidades = useMemo(() => {
    const ids = new Set((contexto?.unidadesDisponiveis ?? []).map((u) => u.id));
    return ids.has(UnidadeEstoqueIds.Secretaria) && ids.has(UnidadeEstoqueIds.Canil);
  }, [contexto?.unidadesDisponiveis]);

  useEffect(() => {
    if (!temAcessoDuasUnidades && aba !== 'todos') setAba('todos');
  }, [temAcessoDuasUnidades, aba]);

  useEffect(() => {
    // Se o usuário trocar a unidade pelo seletor global durante uma aba exclusiva, volta para "Unidade atual".
    if (aba === 'secretaria' && unidadeAtivaId !== UnidadeEstoqueIds.Secretaria) {
      unidadeAntesExclusivoRef.current = null;
      setAba('todos');
    }
    if (aba === 'canil' && unidadeAtivaId !== UnidadeEstoqueIds.Canil) {
      unidadeAntesExclusivoRef.current = null;
      setAba('todos');
    }
  }, [unidadeAtivaId, aba]);

  function aoMudarAba(nova: AbaListagemProdutos) {
    if (aba === 'todos' && nova !== 'todos' && unidadeAtivaId != null) {
      unidadeAntesExclusivoRef.current = unidadeAtivaId;
    }

    setAba(nova);

    if (nova === 'secretaria') {
      definirUnidadeAtiva(UnidadeEstoqueIds.Secretaria);
      return;
    }
    if (nova === 'canil') {
      definirUnidadeAtiva(UnidadeEstoqueIds.Canil);
      return;
    }

    const restaurarId = unidadeAntesExclusivoRef.current;
    unidadeAntesExclusivoRef.current = null;
    if (restaurarId != null && restaurarId !== unidadeAtivaId) {
      definirUnidadeAtiva(restaurarId);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedBusca(busca), 320);
    return () => window.clearTimeout(t);
  }, [busca]);

  useEffect(() => {
    setPage(0);
  }, [debouncedBusca, categoria, status, dataEntrega, dataValidade, aba, orderBy, orderDirection]);

  function limparFiltros() {
    setBusca('');
    setDebouncedBusca('');
    setCategoria('todas');
    setStatus('todos');
    setDataEntrega('');
    setDataValidade('');
    setPage(0);
  }

  const montarFiltroApi = useCallback((): ProdutoFiltro => {
    const termo = debouncedBusca.trim();
    return {
      termo: termo.length > 0 ? termo : undefined,
      categoria: categoria === 'todas' ? undefined : Number(categoria),
      dataEntrega: dataEntrega.trim().length > 0 ? dataEntrega : undefined,
      dataValidade: dataValidade.trim().length > 0 ? dataValidade : undefined,
      statusEstoque: status,
      exclusivoUnidade: aba === 'todos' ? undefined : aba,
    };
  }, [debouncedBusca, categoria, status, dataEntrega, dataValidade, aba]);

  const recarregar = useCallback(async () => {
    if (unidadeAtivaId == null) return;
    await carregar(montarFiltroApi(), {
      pageNumber: page + 1,
      pageSize: rowsPerPage,
      orderBy,
      sortDirection: orderDirection,
    });
  }, [carregar, montarFiltroApi, page, rowsPerPage, unidadeAtivaId, orderBy, orderDirection]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  useEffect(() => {
    const d = estado.dados;
    if (!d || d.totalPages <= 0) return;
    if (page > d.totalPages - 1) setPage(0);
  }, [estado.dados, page]);

  const itens = estado.dados?.items ?? [];
  const totalCount = estado.dados?.totalCount ?? 0;
  const resumo = estado.dados?.resumo;

  const kpis = useMemo(() => {
    if (!resumo) {
      return {
        totalRecorte: 0,
        baixo: 0,
        semEstoque: 0,
        ativos: 0,
        aVencer: 0,
      };
    }
    return {
      totalRecorte: resumo.totalNoRecorte,
      baixo: resumo.baixoEstoque,
      semEstoque: resumo.semEstoque,
      ativos: resumo.ativos,
      aVencer: resumo.aVencer,
    };
  }, [resumo]);

  async function confirmarExclusao() {
    if (idExclusao == null) return;
    const resultado = await excluir(idExclusao);
    if (resultado.ok) {
      setSnackbar({ open: true, mensagem: 'Produto excluído com sucesso.', tipo: 'success' });
      await carregar(montarFiltroApi(), {
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        orderBy,
        sortDirection: orderDirection,
      });
    } else {
      setSnackbar({ open: true, mensagem: resultado.mensagem, tipo: 'error' });
    }
    setIdExclusao(null);
  }

  function handleSort(field: CampoOrdenacaoProduto) {
    if (orderBy === field) {
      setOrderDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(field);
      setOrderDirection('asc');
    }
  }

  return (
    <section style={{ minHeight: '100vh', backgroundColor: estilos.cores.bgShell }}>
      <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <Stack sx={estilos.painel}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  borderColor: estilos.cores.borderForte,
                  color: estilos.cores.textPrimary,
                }}
              >
                Voltar ao início
              </Button>
            </Stack>
            <Typography variant="h5" sx={estilos.titulo}>
              Produtos
            </Typography>
          </Stack>

          {temAcessoDuasUnidades ? (
            <Tabs
              value={aba}
              onChange={(_, v) => aoMudarAba(v as AbaListagemProdutos)}
              textColor="inherit"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: `1px solid ${cores.border}`,
                '& .MuiTab-root': { color: cores.textMuted, textTransform: 'none', fontWeight: 600 },
                '& .Mui-selected': { color: cores.textPrimary },
              }}
            >
              <Tab value="todos" label="Unidade atual" />
              <Tab value="secretaria" label="Só na Secretaria" />
              <Tab value="canil" label="Só no Canil" />
            </Tabs>
          ) : null}

          <FilterBarProdutos
            busca={busca}
            categoria={categoria}
            status={status}
            dataEntrega={dataEntrega}
            dataValidade={dataValidade}
            onBuscaChange={setBusca}
            onCategoriaChange={setCategoria}
            onStatusChange={setStatus}
            onDataEntregaChange={setDataEntrega}
            onDataValidadeChange={setDataValidade}
            onLimpar={limparFiltros}
            onNovoProduto={() => navigate('/produtos/novo')}
          />

          <Stack sx={{ gap: 0.5 }}>
            <KpiSectionProdutos
              carregando={estado.carregando && !estado.dados}
              statusSelecionado={status}
              onStatusChange={setStatus}
              kpis={[
                {
                  titulo: 'Total (filtro atual)',
                  valor: kpis.totalRecorte,
                  icon: <Inventory2OutlinedIcon />,
                  statusFiltro: 'todos',
                },
                {
                  titulo: 'Ativos',
                  valor: kpis.ativos,
                  icon: <TaskAltOutlinedIcon />,
                  statusFiltro: 'ativo',
                },
                {
                  titulo: 'Baixo estoque',
                  valor: kpis.baixo,
                  icon: <ReportProblemOutlinedIcon />,
                  statusFiltro: 'baixo',
                },
                {
                  titulo: 'Próximo vencimento',
                  valor: kpis.aVencer,
                  icon: <EventOutlinedIcon />,
                  statusFiltro: 'a_vencer',
                },
                {
                  titulo: 'Sem estoque',
                  valor: kpis.semEstoque,
                  icon: <RemoveShoppingCartOutlinedIcon />,
                  statusFiltro: 'sem_estoque',
                },
              ]}
            />
            <Typography variant="caption" sx={estilos.legenda}>
              {aba === 'todos'
                ? 'Toque em um card para filtrar a tabela. Os indicadores refletem busca, categoria e datas (sem o filtro de status). Toque de novo no card ativo para limpar o filtro.'
                : aba === 'secretaria'
                  ? 'Produtos com saldo apenas na Secretaria. Toque em um card para filtrar a tabela; toque de novo para limpar o filtro de status.'
                  : 'Produtos com saldo apenas no Canil. Toque em um card para filtrar a tabela; toque de novo para limpar o filtro de status.'}
            </Typography>
          </Stack>

          {estado.erro && <Alert severity="error">{estado.erro}</Alert>}

          {estado.carregando && !estado.dados ? (
            <Stack sx={{ gap: 1 }}>
              <Skeleton variant="rounded" height={68} />
              <Skeleton variant="rounded" height={68} />
              <Skeleton variant="rounded" height={68} />
            </Stack>
          ) : (
            <>
              {itens.length ? (
                <TabelaProdutos
                  itens={itens}
                  orderBy={orderBy}
                  orderDirection={orderDirection}
                  onSort={handleSort}
                  onVisualizar={(id) => navigate(`/produtos/${id}`)}
                  onEditar={(id) => navigate(`/produtos/${id}`)}
                  onExcluir={(id) => setIdExclusao(id)}
                  onMovimentar={(id) => navigate(`/estoque/entradas/novo?idItem=${id}`)}
                  onRegistrarRetirada={(produto: ProdutoLeituraDto, lote: ItemEstoqueDto) => {
                    if (!lote.lote?.trim()) {
                      setSnackbar({ open: true, mensagem: MENSAGEM_LOTE_INVALIDO_RETIRADA, tipo: 'error' });
                      return;
                    }

                    const state = montarRetiradaNavegacaoState({
                      produto,
                      produtoId: produto.id,
                      codItem: produto.codigo,
                      loteId: `${produto.id}-${lote.lote}`,
                      loteCodigo: lote.lote,
                      quantidadeDisponivel: lote.quantidade,
                      retornoRota: '/produtos',
                    });

                    if (!state) {
                      setSnackbar({ open: true, mensagem: MENSAGEM_PRODUTO_SEM_NOME_RETIRADA, tipo: 'error' });
                      return;
                    }

                    navigate(`/estoque/retirada?${montarRetiradaQueryString(state)}`, { state });
                  }}
                />
              ) : (
                <Box sx={estilos.estadoVazio}>
                  <Typography variant="h6">Nenhum produto encontrado</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {aba === 'todos'
                      ? 'Ajuste os filtros, troque de página ou cadastre um novo produto.'
                      : aba === 'secretaria'
                        ? 'Não há produtos com saldo exclusivo na Secretaria.'
                        : 'Não há produtos com saldo exclusivo no Canil.'}
                  </Typography>
                </Box>
              )}
              <TablePagination
                component="div"
                sx={estilos.paginacao}
                rowsPerPageOptions={[5, 10, 25, 50]}
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(Number.parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="Itens por página"
                labelDisplayedRows={({ from, to, count }) =>
                  count === 0 ? '0–0 de 0' : `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </>
          )}
        </Stack>
      </MotionBox>

      <Dialog open={idExclusao != null} onClose={() => setIdExclusao(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Deseja excluir este produto apenas da unidade atual? O cadastro nas outras unidades não será alterado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIdExclusao(null)}>Cancelar</Button>
          <Button onClick={confirmarExclusao} color="error" variant="contained" disabled={carregandoExclusao}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2600}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.tipo} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.mensagem}
        </Alert>
      </Snackbar>
    </section>
  );
}
