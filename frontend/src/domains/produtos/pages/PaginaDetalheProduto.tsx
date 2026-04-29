import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { Box, Button, CssBaseline, IconButton, Stack, ThemeProvider, createTheme, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { mapearPapelUsuario } from '../../../shared/types/papelUsuario';
import { SidebarEstoque } from '../../estoque/components/SidebarEstoque';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { LoteList } from '../components/LoteList';
import { ProductHeader } from '../components/ProductHeader';
import { ProductInfoCard } from '../components/ProductInfoCard';
import { ProductKpiCards } from '../components/ProductKpiCards';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import { useProdutoDetalhe } from '../hooks/useProdutos';
import type { LoteProduto } from '../types/loteProduto';
import { mapearItensEstoqueParaLotes } from '../utils/mapearLotesDoProduto';

const temaDetalheProduto = createTheme({
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
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function textoProximoVencimento(lotes: LoteProduto[]): string {
  if (!lotes.length) return '—';
  const ordenados = [...lotes].sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime());
  return new Date(ordenados[0].validade).toLocaleDateString('pt-BR');
}

export function PaginaDetalheProduto() {
  const params = useParams();
  const location = useLocation();
  const id = Number(params.id);
  const navigate = useNavigate();
  const { usuario } = useAutenticacao();
  const papelUsuario = mapearPapelUsuario(usuario?.permissao);
  const themeExterno = useTheme();
  const isMobile = useMediaQuery(themeExterno.breakpoints.down('sm'));
  const ehMobileMenu = useMediaQuery(themeExterno.breakpoints.down('md'));
  const [drawerAbertoMobile, setDrawerAbertoMobile] = useState(false);

  const { estado, carregar } = useProdutoDetalhe(Number.isFinite(id) ? id : undefined);
  const { excluir, carregando, erro } = useMutacaoProduto();

  useEffect(() => {
    void carregar();
  }, [carregar, location.search]);

  const p = estado.dados;

  const lotes = useMemo(
    () => (p ? mapearItensEstoqueParaLotes(p.id, p.itensEstoque) : []),
    [p],
  );

  const totalEstoque = useMemo(() => lotes.reduce((acc, l) => acc + l.quantidade, 0), [lotes]);
  const lotesAtivos = useMemo(() => lotes.filter((l) => l.quantidade > 0).length, [lotes]);
  const proximoVencimentoTexto = useMemo(() => textoProximoVencimento(lotes), [lotes]);

  async function aoExcluir() {
    if (!Number.isFinite(id)) return;
    if (!window.confirm('Confirma excluir este produto?')) return;
    const ok = await excluir(id);
    if (ok) navigate('/produtos');
  }

  function handleRetirada(lote: LoteProduto) {
    if (!p) return;
    navigate('/estoque/retirada', {
      state: {
        produtoId: p.id,
        produtoNome: p.nomeOuDescricaoSimples,
        codItem: p.codigo,
        loteId: lote.id,
        loteCodigo: lote.codigo,
        quantidadeDisponivel: lote.quantidade,
        retornoRota: `/produtos/${p.id}`,
      },
    });
  }

  return (
    <ThemeProvider theme={temaDetalheProduto}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#020617' }}>
        <SidebarEstoque
          abertoMobile={drawerAbertoMobile}
          aoFecharMobile={() => setDrawerAbertoMobile(false)}
          ehMobile={ehMobileMenu}
          papelUsuario={papelUsuario}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            color: '#e2e8f0',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            {ehMobileMenu ? (
              <IconButton color="inherit" onClick={() => setDrawerAbertoMobile(true)} sx={{ color: '#e2e8f0' }}>
                <MenuOutlinedIcon />
              </IconButton>
            ) : (
              <Box />
            )}
            <Button
              variant="text"
              onClick={() => navigate('/produtos')}
              sx={{ color: 'rgba(203, 213, 225, 0.9)' }}
            >
              Lista de produtos
            </Button>
          </Stack>

          <PainelErro mensagem={estado.erro ?? erro} />
          <IndicadorCarregamento visivel={estado.carregando || carregando} />

          {p && (
            <>
              <ProductHeader
                titulo={p.nomeOuDescricaoSimples}
                onVoltar={() => navigate('/dashboard')}
                onVoltarInicio={() => navigate('/dashboard')}
              />

              <ProductKpiCards
                totalEstoque={totalEstoque}
                lotesAtivos={lotesAtivos}
                proximoVencimentoTexto={proximoVencimentoTexto}
                carregando={estado.carregando}
              />

              <ProductInfoCard
                codigo={p.codigo}
                categoria={p.categoria}
                unidade={p.unidade}
                nivelMinimo={p.itemNivelEstoque.nivelMinimoEstoque}
              />

              <LoteList
                idItem={p.id}
                codItem={p.codigo}
                lotes={lotes}
                isMobile={isMobile}
                onRetirar={handleRetirada}
                onExcluirProduto={aoExcluir}
              />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
