import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { Box, Button, CssBaseline, IconButton, Stack, Tab, Tabs, TextField, ThemeProvider, Typography, createTheme, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState, type FormEvent, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { mapearPapelUsuario } from '../../../shared/types/papelUsuario';
import { listarInsumosApi } from '../../insumos/api/insumosApi';
import { listarMedicamentosApi } from '../../medicamentos/api/medicamentosApi';
import { listarProdutosApi } from '../../produtos/api/produtosApi';
import { DataTableEstoque } from '../components/DataTableEstoque';
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
  const [filtroNome, setFiltroNome] = useState('');
  const [abaTipo, setAbaTipo] = useState(lerAbaEstoqueSalva);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [linhasOperacionais, setLinhasOperacionais] = useState<LinhaOperacionalEstoque[]>([]);
  const [drawerAbertoMobile, setDrawerAbertoMobile] = useState(false);
  const theme = useTheme();
  const ehMobileMenu = useMediaQuery(theme.breakpoints.down('md'));

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

    void carregarDashboard();
    return () => {
      ativo = false;
    };
  }, []);

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

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
              Estoque
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)' }}>
              Visao operacional com filtros e tabela de itens
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.4, gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
                Operacao de estoque
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
                    minWidth: 240,
                    '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#0f172a' },
                    '& .MuiInputBase-input': { color: '#e2e8f0' },
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
              sx={{
                mb: 2,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                '& .MuiTab-root': { color: 'rgba(226,232,240,0.72)' },
                '& .Mui-selected': { color: '#e2e8f0' },
              }}
            >
              <Tab label={`Produtos (${contagemPorOrigem.produtos})`} sx={{ textTransform: 'none', fontWeight: 500 }} />
              <Tab
                label={`Medicamentos (${contagemPorOrigem.medicamentos})`}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              />
              <Tab label={`Insumos (${contagemPorOrigem.insumos})`} sx={{ textTransform: 'none', fontWeight: 500 }} />
            </Tabs>

            {erroCarregamento ? (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {erroCarregamento}
              </Typography>
            ) : null}
            <DataTableEstoque linhas={linhasFiltradas} carregando={carregando} aoClicarItem={navegarParaDetalhe} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
