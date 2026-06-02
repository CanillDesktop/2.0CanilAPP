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
  TablePagination,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbarRetornoListagem } from '../../../shared/hooks/useSnackbarRetornoListagem';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { MENSAGEM_PRODUTO_SEM_NOME_RETIRADA, montarRetiradaNavegacaoState } from '../../estoque/utils/retiradaNavegacao';
import { FilterBarProdutos } from '../components/FilterBarProdutos';
import { KpiSectionProdutos } from '../components/KpiSectionProdutos';
import { TabelaProdutos } from '../components/TabelaProdutos';
import { useListaProdutosPaginados } from '../hooks/useProdutos';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import type { ProdutoFiltroDto, ProdutoLeituraDto, ProdutoStatusEstoqueFiltro } from '../types/tiposProdutos';
import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';

const MotionBox = motion(Box);

export function PaginaListagemProdutos() {
  const { estado, carregar } = useListaProdutosPaginados();
  const { excluir, carregando: carregandoExclusao } = useMutacaoProduto();
  const navigate = useNavigate();
  const estilos = useEstilosListagem();
  const [busca, setBusca] = useState('');
  const [debouncedBusca, setDebouncedBusca] = useState('');
  const [categoria, setCategoria] = useState<'todas' | string>('todas');
  const [status, setStatus] = useState<ProdutoStatusEstoqueFiltro>('todos');
  const [idExclusao, setIdExclusao] = useState<number | null>(null);
  const { snackbar, setSnackbar } = useSnackbarRetornoListagem({
    open: false,
    mensagem: '',
    tipo: 'success',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedBusca(busca), 320);
    return () => window.clearTimeout(t);
  }, [busca]);

  useEffect(() => {
    setPage(0);
  }, [debouncedBusca, categoria, status]);

  const montarFiltroApi = useCallback((): ProdutoFiltroDto => {
    const termo = debouncedBusca.trim();
    return {
      termoBusca: termo.length > 0 ? termo : undefined,
      categoria: categoria === 'todas' ? undefined : Number(categoria),
      statusEstoque: status,
    };
  }, [debouncedBusca, categoria, status]);

  const recarregar = useCallback(async () => {
    await carregar(montarFiltroApi(), { pageNumber: page + 1, pageSize: rowsPerPage });
  }, [carregar, montarFiltroApi, page, rowsPerPage]);

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
      await carregar(montarFiltroApi(), { pageNumber: page + 1, pageSize: rowsPerPage });
    } else {
      setSnackbar({ open: true, mensagem: resultado.mensagem, tipo: 'error' });
    }
    setIdExclusao(null);
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

          <FilterBarProdutos
            busca={busca}
            categoria={categoria}
            status={status}
            onBuscaChange={setBusca}
            onCategoriaChange={setCategoria}
            onStatusChange={setStatus}
            onNovoProduto={() => navigate('/produtos/novo')}
          />

          <Stack sx={{ gap: 0.5 }}>
            <KpiSectionProdutos
              carregando={estado.carregando && !estado.dados}
              kpis={[
                {
                  titulo: 'Total (filtro atual)',
                  valor: kpis.totalRecorte,
                  icon: <Inventory2OutlinedIcon />,
                  cor: 'primary.main',
                },
                {
                  titulo: 'Ativos',
                  valor: kpis.ativos,
                  icon: <TaskAltOutlinedIcon />,
                  cor: 'success.main',
                },
                {
                  titulo: 'Baixo estoque',
                  valor: kpis.baixo,
                  icon: <ReportProblemOutlinedIcon />,
                  cor: 'warning.main',
                },
                {
                  titulo: 'Próximo vencimento',
                  valor: kpis.aVencer,
                  icon: <EventOutlinedIcon />,
                  cor: 'info.main',
                },
                {
                  titulo: 'Sem estoque',
                  valor: kpis.semEstoque,
                  icon: <RemoveShoppingCartOutlinedIcon />,
                  cor: 'error.main',
                },
              ]}
            />
            <Typography variant="caption" sx={estilos.legenda}>
              Indicadores refletem todos os produtos que obedecem a busca e categoria (sem o filtro de status). O
              filtro de status restringe apenas a tabela e a paginação.
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
                  onVisualizar={(id) => navigate(`/produtos/${id}`)}
                  onEditar={(id) => navigate(`/produtos/${id}`)}
                  onExcluir={(id) => setIdExclusao(id)}
                  onMovimentar={(id) => navigate(`/estoque/lotes/novo?idItem=${id}`)}
                  onRegistrarRetirada={(produto: ProdutoLeituraDto, lote: ItemEstoqueDto) => {
                    const state = montarRetiradaNavegacaoState({
                      produto,
                      produtoId: produto.id,
                      codItem: produto.codigo,
                      loteId: `${produto.id}-${lote.lote ?? ''}`,
                      loteCodigo: lote.lote ?? 'Sem código',
                      quantidadeDisponivel: lote.quantidade,
                      retornoRota: '/produtos',
                    });

                    if (!state) {
                      setSnackbar({ open: true, mensagem: MENSAGEM_PRODUTO_SEM_NOME_RETIRADA, tipo: 'error' });
                      return;
                    }

                    navigate('/estoque/retirada', { state });
                  }}
                />
              ) : (
                <Box sx={estilos.estadoVazio}>
                  <Typography variant="h6">Nenhum produto encontrado</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajuste os filtros, troque de página ou cadastre um novo produto.
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
          <Typography variant="body2">Deseja realmente excluir este produto?</Typography>
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
