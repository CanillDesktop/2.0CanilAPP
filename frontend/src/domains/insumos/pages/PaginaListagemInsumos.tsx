import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';
import { FilterBarInsumos } from '../components/FilterBarInsumos';
import { KpiSectionInsumos } from '../components/KpiSectionInsumos';
import { TabelaInsumos } from '../components/TabelaInsumos';
import { useListaInsumos, useMutacaoInsumo } from '../hooks/useInsumos';
import type { InsumoLeituraDto } from '../types/tiposInsumos';

const MotionBox = motion(Box);

type StatusInsumo = 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer';

function obterStatus(item: InsumoLeituraDto): StatusInsumo {
  const quantidade = item.itensEstoque.reduce((acc, lote) => acc + lote.quantidade, 0);
  const minimo = item.itemNivelEstoque?.nivelMinimoEstoque ?? 0;
  const hoje = new Date();
  const limiteVencimento = new Date();
  limiteVencimento.setDate(hoje.getDate() + 30);
  const temLoteAVencer = item.itensEstoque.some((lote) => {
    if (!lote.dataValidade) return false;
    const validade = new Date(lote.dataValidade);
    if (Number.isNaN(validade.getTime())) return false;
    return validade >= hoje && validade <= limiteVencimento;
  });
  if (quantidade <= 0) return 'sem_estoque';
  if (temLoteAVencer) return 'a_vencer';
  if (quantidade < minimo) return 'baixo';
  return 'ativo';
}

export function PaginaListagemInsumos() {
  const { estado, carregar } = useListaInsumos();
  const { excluir, carregando: carregandoExclusao } = useMutacaoInsumo();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [unidade, setUnidade] = useState<'todas' | string>('todas');
  const [status, setStatus] = useState<'todos' | StatusInsumo>('todos');
  const [idExclusao, setIdExclusao] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; mensagem: string; tipo: 'success' | 'error' }>({
    open: false,
    mensagem: '',
    tipo: 'success',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    setPage(0);
  }, [busca, unidade, status]);

  const itensBase = estado.dados ?? [];
  const unidades = Array.from(new Set(itensBase.map((item) => String(item.unidade)))).sort((a, b) => Number(a) - Number(b));

  const itensFiltrados = useMemo(() => {
    return itensBase.filter((item) => {
      const texto = `${item.codigo} ${item.nomeOuDescricaoSimples}`.toLowerCase();
      const bateBusca = texto.includes(busca.toLowerCase());
      const bateUnidade = unidade === 'todas' ? true : String(item.unidade) === unidade;
      const statusItem = obterStatus(item);
      const bateStatus = status === 'todos' ? true : statusItem === status;
      return bateBusca && bateUnidade && bateStatus;
    });
  }, [busca, unidade, status, itensBase]);

  const itensPagina = useMemo(() => {
    const start = page * rowsPerPage;
    return itensFiltrados.slice(start, start + rowsPerPage);
  }, [itensFiltrados, page, rowsPerPage]);

  const kpis = useMemo(() => {
    const total = itensPagina.length;
    const baixo = itensPagina.filter((item) => obterStatus(item) === 'baixo').length;
    const semEstoque = itensPagina.filter((item) => obterStatus(item) === 'sem_estoque').length;
    const ativos = itensPagina.filter((item) => obterStatus(item) === 'ativo').length;
    return { total, baixo, semEstoque, ativos };
  }, [itensPagina]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(itensFiltrados.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [itensFiltrados.length, page, rowsPerPage]);

  async function confirmarExclusao() {
    if (idExclusao == null) return;
    const ok = await excluir(idExclusao);
    if (ok) {
      setSnackbar({ open: true, mensagem: 'Insumo excluido com sucesso.', tipo: 'success' });
      await carregar();
    } else {
      setSnackbar({ open: true, mensagem: 'Nao foi possivel excluir o insumo.', tipo: 'error' });
    }
    setIdExclusao(null);
  }

  return (
    <section>
      <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <Stack
          sx={{
            gap: 3,
            backgroundColor: '#020617',
            borderRadius: 3,
            p: { xs: 1.5, md: 2 },
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Voltar ao inicio
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
              Insumos
            </Typography>
          </Stack>

          <FilterBarInsumos
            busca={busca}
            unidade={unidade}
            status={status}
            unidades={unidades}
            onBuscaChange={setBusca}
            onUnidadeChange={setUnidade}
            onStatusChange={setStatus}
            onNovoInsumo={() => navigate('/insumos/novo')}
          />

          <Stack sx={{ gap: 0.5 }}>
            <KpiSectionInsumos
              carregando={estado.carregando}
              kpis={[
                { titulo: 'Total (nesta página)', valor: kpis.total, icon: <Inventory2OutlinedIcon />, cor: 'primary.main' },
                { titulo: 'Baixo estoque', valor: kpis.baixo, icon: <ReportProblemOutlinedIcon />, cor: 'warning.main' },
                { titulo: 'Sem estoque', valor: kpis.semEstoque, icon: <RemoveShoppingCartOutlinedIcon />, cor: 'error.main' },
                { titulo: 'Ativos', valor: kpis.ativos, icon: <TaskAltOutlinedIcon />, cor: 'success.main' },
              ]}
            />
            <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)', px: 0.5 }}>
              Indicadores consideram só os insumos desta página da tabela; filtros aplicam sobre a lista completa carregada.
            </Typography>
          </Stack>

          {estado.erro && <Alert severity="error">{estado.erro}</Alert>}

          {estado.carregando ? (
            <Stack sx={{ gap: 1 }}>
              <Skeleton variant="rounded" height={68} />
              <Skeleton variant="rounded" height={68} />
              <Skeleton variant="rounded" height={68} />
            </Stack>
          ) : (
            <>
              {itensPagina.length ? (
                <TabelaInsumos
                  itens={itensPagina}
                  onVisualizar={(id) => navigate(`/insumos/${id}`)}
                  onEditar={(id) => navigate(`/insumos/${id}`)}
                  onExcluir={(id) => setIdExclusao(id)}
                  onMovimentar={(id) => navigate(`/estoque/lotes/novo?idItem=${id}`)}
                  onRegistrarRetirada={(insumo: InsumoLeituraDto, lote: ItemEstoqueDto) =>
                    navigate('/estoque/retirada', {
                      state: {
                        produtoId: insumo.id,
                        produtoNome: insumo.nomeOuDescricaoSimples,
                        codItem: insumo.codigo,
                        loteId: `${insumo.id}-${lote.lote ?? ''}`,
                        loteCodigo: lote.lote ?? 'Sem codigo',
                        quantidadeDisponivel: lote.quantidade,
                        retornoRota: '/insumos',
                      },
                    })
                  }
                />
              ) : (
                <Box
                  sx={{
                    border: '1px dashed rgba(255,255,255,0.3)',
                    borderRadius: 3,
                    p: 3,
                    backgroundColor: '#0f172a',
                  }}
                >
                  <Typography variant="h6">Nenhum insumo encontrado</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajuste os filtros, troque de página ou cadastre um novo insumo.
                  </Typography>
                </Box>
              )}
              <TablePagination
                component="div"
                sx={{
                  color: '#e2e8f0',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  '& .MuiTablePagination-toolbar': { minHeight: 52 },
                  '& .MuiTablePagination-selectIcon, & .MuiTablePagination-actions': { color: '#94a3b8' },
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                count={itensFiltrados.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(Number.parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="Itens por página"
                labelDisplayedRows={({ from, to, count }) => (count > 0 ? `${from}-${to} de ${count}` : '0-0 de 0')}
              />
            </>
          )}
        </Stack>
      </MotionBox>

      <Dialog open={idExclusao != null} onClose={() => setIdExclusao(null)}>
        <DialogTitle>Confirmar exclusao</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Deseja realmente excluir este insumo?</Typography>
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
