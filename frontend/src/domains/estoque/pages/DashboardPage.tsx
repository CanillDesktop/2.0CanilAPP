import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import { Box, Button, CssBaseline, IconButton, Stack, ThemeProvider, Typography, createTheme, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState, type FormEvent, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { mapearPapelUsuario } from '../../../shared/types/papelUsuario';
import { listarInsumosApi } from '../../insumos/api/insumosApi';
import { listarMedicamentosApi } from '../../medicamentos/api/medicamentosApi';
import { listarProdutosApi } from '../../produtos/api/produtosApi';
import { DesktopEstoque } from '../components/DesktopEstoque';
import { MobileEstoque } from '../components/MobileEstoque';
import type { AcaoRapida } from '../components/QuickActions';
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

export function DashboardPage() {
  const navigate = useNavigate();
  const { usuario, sair } = useAutenticacao();
  const papelUsuario = mapearPapelUsuario(usuario?.permissao);
  const [filtroNome, setFiltroNome] = useState('');
  const [abaTipo, setAbaTipo] = useState(lerAbaEstoqueSalva);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [linhasOperacionais, setLinhasOperacionais] = useState<LinhaOperacionalEstoque[]>([]);
  const [produtosAVencer, setProdutosAVencer] = useState(0);
  const [drawerAbertoMobile, setDrawerAbertoMobile] = useState(false);
  const [emTransicao, setEmTransicao] = useState(false);
  const theme = useTheme();
  const ehMobileLayoutConteudo = useMediaQuery(theme.breakpoints.down('sm'));
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

  const totalBaixoEstoque = linhasOperacionais.filter((item) => item.quantidade < item.minimo).length;
  const itensAbaixoMinimo = linhasOperacionais.filter((item) => item.quantidade < item.minimo);
  const itensProximoVencimento = linhasOperacionais.filter((item) => item.status === 'proximo_vencimento');

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

  const totalItens = linhasOperacionais.length;

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
              color="inherit"
              sx={{ borderColor: 'rgba(148,163,184,0.35)', color: '#e2e8f0' }}
              onClick={() => {
                sair();
                navigate('/login');
              }}
            >
              Sair
            </Button>
          </Stack>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
              Ola, {usuario?.primeiroNome ?? 'equipe'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)' }}>
              {ehMobileLayoutConteudo ? 'Operação de estoque' : 'Visão analítica do estoque'}
            </Typography>
          </Box>

          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: emTransicao ? 0.7 : 1, y: 0 }}
            transition={{ duration: 0.32 }}
            sx={{ mt: 1 }}
          >
            <Box sx={{ p: { xs: 0, sm: 0 } }}>
              {ehMobileLayoutConteudo ? (
                <MobileEstoque
                  carregando={carregando}
                  erroCarregamento={erroCarregamento}
                  totalItens={totalItens}
                  totalBaixoEstoque={totalBaixoEstoque}
                  produtosAVencer={produtosAVencer}
                  itensAbaixoMinimo={itensAbaixoMinimo}
                  itensProximoVencimento={itensProximoVencimento}
                  acoesRapidas={acoesRapidas}
                  iconeTotal={<WarehouseOutlinedIcon />}
                  iconeBaixo={<ReportProblemOutlinedIcon />}
                  iconeVencer={<SwapHorizOutlinedIcon />}
                  onItemClick={navegarParaDetalhe}
                />
              ) : (
                <DesktopEstoque
                  carregando={carregando}
                  erroCarregamento={erroCarregamento}
                  linhasFiltradas={linhasFiltradas}
                  filtroNome={filtroNome}
                  onFiltroNomeChange={setFiltroNome}
                  onConsultar={aoConsultar}
                  abaTipo={abaTipo}
                  onAbaChange={aoMudarAba}
                  contagemPorOrigem={contagemPorOrigem}
                  totalItens={totalItens}
                  totalBaixoEstoque={totalBaixoEstoque}
                  produtosAVencer={produtosAVencer}
                  itensAbaixoMinimo={itensAbaixoMinimo}
                  itensProximoVencimento={itensProximoVencimento}
                  acoesRapidas={acoesRapidas}
                  iconeTotal={<WarehouseOutlinedIcon />}
                  iconeBaixo={<ReportProblemOutlinedIcon />}
                  iconeVencer={<SwapHorizOutlinedIcon />}
                  onItemClick={navegarParaDetalhe}
                />
              )}
            </Box>
          </MotionBox>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
