import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import {
  Alert,
  Box,
  Button,
  CssBaseline,
  Grid,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
  TextField,
  createTheme,
  useMediaQuery,
  useTheme,
  ThemeProvider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState, type FormEvent } from 'react';
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

export function PaginaListagemEstoque() {
  const navigate = useNavigate();
  const { usuario, sair } = useAutenticacao();
  const [idConsulta, setIdConsulta] = useState('');
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
          const maiorDataMovimentacao = item.itensEstoque
            .map((lote) => new Date(lote.dataEntrega))
            .filter((data) => !Number.isNaN(data.getTime()))
            .sort((a, b) => b.getTime() - a.getTime())[0];

          let status: LinhaOperacionalEstoque['status'] = 'ok';
          if (quantidadeAtual <= 0) status = 'critico';
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
    const id = Number(idConsulta);
    if (!Number.isFinite(id) || id <= 0) return;
    navegarComTransicao(`/estoque/item/${id}`);
  }

  function navegarParaDetalhe(item: LinhaOperacionalEstoque) {
    if (item.origem === 'produto') navigate(`/produtos/${item.id}`);
    else if (item.origem === 'medicamento') navigate(`/medicamentos/${item.id}`);
    else navigate(`/insumos/${item.id}`);
  }

  const totalBaixoEstoque = linhasOperacionais.filter((item) => item.quantidade < item.minimo).length;
  const itensAbaixoMinimo = linhasOperacionais.filter((item) => item.quantidade < item.minimo);

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
    {
      id: 'sincronizar',
      titulo: 'Sincronizar',
      descricao: 'Atualizar dados com o servidor',
      icone: 'sincronizar',
      onClick: () => navegarComTransicao('/sincronizacao'),
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
              Visao operacional do estoque em tempo real
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
                  <Paper sx={{ borderRadius: 3, p: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Itens abaixo do minimo ({itensAbaixoMinimo.length})
                      </Typography>
                      <Button
                        variant="text"
                        startIcon={<LocalShippingOutlinedIcon />}
                        onClick={() => navigate('/sincronizacao')}
                      >
                        Sincronizar agora
                      </Button>
                    </Stack>
                    {carregando ? (
                      <Typography variant="body2" color="text.secondary">
                        Carregando alertas...
                      </Typography>
                    ) : itensAbaixoMinimo.length ? (
                      <List dense>
                        {itensAbaixoMinimo.slice(0, 8).map((item) => (
                          <ListItem
                            key={item.id}
                            sx={{ px: 0, cursor: 'pointer' }}
                            onClick={() => navegarParaDetalhe(item)}
                          >
                            {item.nome} - atual {item.quantidade} / minimo {item.minimo}
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="success.main">
                        Nenhum item abaixo do minimo no momento.
                      </Typography>
                    )}
                  </Paper>
                )}
              </Grid>

              <Grid size={12}>
                <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', mb: 1.4, gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Visao operacional
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={aoConsultar}
                    sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <TextField
                      value={idConsulta}
                      onChange={(e) => setIdConsulta(e.target.value)}
                      placeholder="Consultar item por ID"
                      inputMode="numeric"
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
                <DataTableEstoque
                  linhas={linhasOperacionais}
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
