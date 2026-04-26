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
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterBarProdutos } from '../components/FilterBarProdutos';
import { KpiSectionProdutos } from '../components/KpiSectionProdutos';
import { TabelaProdutos } from '../components/TabelaProdutos';
import { useListaProdutos } from '../hooks/useProdutos';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import type { ProdutoLeituraDto } from '../types/tiposProdutos';
import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';

const MotionBox = motion(Box);

const produtosMock: ProdutoLeituraDto[] = [
  {
    id: 9901,
    codigo: 'PRD-001',
    nomeOuDescricaoSimples: 'Racao Premium Adulto',
    descricaoDetalhada: 'Racao seca premium',
    unidade: 1,
    categoria: 1,
    itemNivelEstoque: { id: 9901, nivelMinimoEstoque: 30 },
    itensEstoque: [
      { id: 9901, codigo: 'PRD-001', quantidade: 120, dataEntrega: '2026-04-20', dataValidade: '2026-07-10' },
    ],
  },
  {
    id: 9902,
    codigo: 'PRD-002',
    nomeOuDescricaoSimples: 'Areia Higienica',
    descricaoDetalhada: 'Areia com controle de odor',
    unidade: 1,
    categoria: 2,
    itemNivelEstoque: { id: 9902, nivelMinimoEstoque: 25 },
    itensEstoque: [{ id: 9902, codigo: 'PRD-002', quantidade: 10, dataEntrega: '2026-04-19', dataValidade: null }],
  },
];

function obterStatus(item: ProdutoLeituraDto): 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer' {
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

export function PaginaListagemProdutos() {
  const { estado, carregar } = useListaProdutos();
  const { excluir, carregando: carregandoExclusao } = useMutacaoProduto();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<'todas' | string>('todas');
  const [status, setStatus] = useState<'todos' | 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer'>('todos');
  const [idExclusao, setIdExclusao] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; mensagem: string; tipo: 'success' | 'error' }>({
    open: false,
    mensagem: '',
    tipo: 'success',
  });

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const itensBase = estado.dados?.length ? estado.dados : produtosMock;
  const categorias = Array.from(new Set(itensBase.map((item) => String(item.categoria))));

  const itensFiltrados = useMemo(() => {
    return itensBase.filter((item) => {
      const texto = `${item.codigo} ${item.nomeOuDescricaoSimples}`.toLowerCase();
      const bateBusca = texto.includes(busca.toLowerCase());
      const bateCategoria = categoria === 'todas' ? true : String(item.categoria) === categoria;
      const statusItem = obterStatus(item);
      const bateStatus = status === 'todos' ? true : statusItem === status;
      return bateBusca && bateCategoria && bateStatus;
    });
  }, [busca, categoria, status, itensBase]);

  const kpis = useMemo(() => {
    const total = itensFiltrados.length;
    const baixo = itensFiltrados.filter((item) => obterStatus(item) === 'baixo').length;
    const semEstoque = itensFiltrados.filter((item) => obterStatus(item) === 'sem_estoque').length;
    const ativos = itensFiltrados.filter((item) => obterStatus(item) === 'ativo').length;
    return { total, baixo, semEstoque, ativos };
  }, [itensFiltrados]);

  async function confirmarExclusao() {
    if (idExclusao == null) return;
    const ok = await excluir(idExclusao);
    if (ok) {
      setSnackbar({ open: true, mensagem: 'Produto excluido com sucesso.', tipo: 'success' });
      await carregar();
    } else {
      setSnackbar({ open: true, mensagem: 'Nao foi possivel excluir o produto.', tipo: 'error' });
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
              Produtos
            </Typography>
          </Stack>

          <FilterBarProdutos
            busca={busca}
            categoria={categoria}
            status={status}
            categorias={categorias}
            onBuscaChange={setBusca}
            onCategoriaChange={setCategoria}
            onStatusChange={setStatus}
            onNovoProduto={() => navigate('/produtos/novo')}
          />

          <KpiSectionProdutos
            carregando={estado.carregando}
            kpis={[
              { titulo: 'Total de produtos', valor: kpis.total, icon: <Inventory2OutlinedIcon />, cor: 'primary.main' },
              { titulo: 'Baixo estoque', valor: kpis.baixo, icon: <ReportProblemOutlinedIcon />, cor: 'warning.main' },
              { titulo: 'Sem estoque', valor: kpis.semEstoque, icon: <RemoveShoppingCartOutlinedIcon />, cor: 'error.main' },
              { titulo: 'Ativos', valor: kpis.ativos, icon: <TaskAltOutlinedIcon />, cor: 'success.main' },
            ]}
          />

          {estado.erro && <Alert severity="error">{estado.erro}</Alert>}

          {estado.carregando ? (
            <Stack sx={{ gap: 1 }}>
              <Skeleton variant="rounded" height={68} />
              <Skeleton variant="rounded" height={68} />
              <Skeleton variant="rounded" height={68} />
            </Stack>
          ) : (
            <>
              {itensFiltrados.length ? (
                <TabelaProdutos
                  itens={itensFiltrados}
                  onVisualizar={(id) => navigate(`/produtos/${id}`)}
                  onEditar={(id) => navigate(`/produtos/${id}`)}
                  onExcluir={(id) => setIdExclusao(id)}
                  onMovimentar={(id) => navigate(`/estoque/lotes/novo?idItem=${id}`)}
                  onRegistrarRetirada={(produto: ProdutoLeituraDto, lote: ItemEstoqueDto) =>
                    navigate('/estoque/retirada', {
                      state: {
                        produtoId: produto.id,
                        produtoNome: produto.nomeOuDescricaoSimples,
                        codItem: produto.codigo,
                        loteId: `${produto.id}-${lote.lote ?? ''}`,
                        loteCodigo: lote.lote ?? 'Sem codigo',
                        quantidadeDisponivel: lote.quantidade,
                        retornoRota: '/produtos',
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
                  <Typography variant="h6">Nenhum produto encontrado</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajuste os filtros ou cadastre um novo produto.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Stack>
      </MotionBox>

      <Dialog open={idExclusao != null} onClose={() => setIdExclusao(null)}>
        <DialogTitle>Confirmar exclusao</DialogTitle>
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
