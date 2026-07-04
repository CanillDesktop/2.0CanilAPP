import { alpha } from '@mui/material/styles';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { larguraConteudoPagina, paddingPaginaShell } from '../../../shared/theme/estilosLayoutPagina';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
import { listarAlertasDashboardApi, obterResumoDashboardApi } from '../api/dashboardApi';
import { AlertaCard } from '../components/AlertaCard';
import { BuscaCategoriaTabs } from '../components/BuscaCategoriaTabs';
import { ResumoItensCadastrados, type ContagemPorClasse } from '../components/ResumoItensCadastrados';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';
import { mapearAlertaDashboardParaLinha } from '../utils/mapearLinhaOperacionalEstoque';

const MotionBox = motion(Box);
const SPACING = {
  sm: 2,
  md: 3,
  lg: 4,
} as const;

const CHIPS_CATEGORIA_ALERTAS: { valor: '' | LinhaOperacionalEstoque['origem']; rotulo: string }[] = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'produto', rotulo: 'Produtos' },
  { valor: 'medicamento', rotulo: 'Medicamentos' },
  { valor: 'insumo', rotulo: 'Insumos' },
];

const contagemInicial: ContagemPorClasse = { produtos: 0, medicamentos: 0, insumos: 0 };

export function DashboardPage() {
  const navigate = useNavigate();
  const { usuario } = useAutenticacao();
  const { unidadeAtivaId } = useUnidadeEstoque();
  const { cores } = useTemaApp();
  const estilos = useEstilosListagem();
  const [carregandoResumo, setCarregandoResumo] = useState(true);
  const [carregandoAlertas, setCarregandoAlertas] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [contagemPorOrigem, setContagemPorOrigem] = useState<ContagemPorClasse>(contagemInicial);
  const [totalItens, setTotalItens] = useState(0);
  const [emTransicao, setEmTransicao] = useState(false);
  const [categoria, setCategoria] = useState<'' | LinhaOperacionalEstoque['origem']>('');
  const [busca, setBusca] = useState('');
  const [debouncedBusca, setDebouncedBusca] = useState('');
  const [pageMinimo, setPageMinimo] = useState(1);
  const [pageVencimento, setPageVencimento] = useState(1);
  const [alertasMinimo, setAlertasMinimo] = useState<LinhaOperacionalEstoque[]>([]);
  const [alertasVencimento, setAlertasVencimento] = useState<LinhaOperacionalEstoque[]>([]);
  const [totalMinimo, setTotalMinimo] = useState(0);
  const [totalVencimento, setTotalVencimento] = useState(0);
  const [totalPagesMinimo, setTotalPagesMinimo] = useState(1);
  const [totalPagesVencimento, setTotalPagesVencimento] = useState(1);

  const theme = useTheme();
  const ehMobileLayoutConteudo = useMediaQuery(theme.breakpoints.down('sm'));
  const itensPorPaginaAlertas = ehMobileLayoutConteudo ? 3 : 5;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedBusca(busca), 300);
    return () => window.clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    setPageMinimo(1);
    setPageVencimento(1);
  }, [categoria, debouncedBusca, unidadeAtivaId]);

  useEffect(() => {
    let ativo = true;

    async function carregarResumo() {
      if (unidadeAtivaId == null) {
        setContagemPorOrigem(contagemInicial);
        setTotalItens(0);
        setCarregandoResumo(false);
        return;
      }

      setCarregandoResumo(true);
      setErroCarregamento(null);
      try {
        const resumo = await obterResumoDashboardApi(unidadeAtivaId);
        if (!ativo) return;
        setContagemPorOrigem({
          produtos: resumo.produtos,
          medicamentos: resumo.medicamentos,
          insumos: resumo.insumos,
        });
        setTotalItens(resumo.totalItens);
      } catch {
        if (!ativo) return;
        setErroCarregamento(MSG_ERRO.carregarEstoque);
        setContagemPorOrigem(contagemInicial);
        setTotalItens(0);
      } finally {
        if (ativo) setCarregandoResumo(false);
      }
    }

    void carregarResumo();
    return () => {
      ativo = false;
    };
  }, [unidadeAtivaId]);

  const carregarAlertas = useCallback(async () => {
    if (unidadeAtivaId == null) {
      setAlertasMinimo([]);
      setAlertasVencimento([]);
      setTotalMinimo(0);
      setTotalVencimento(0);
      setTotalPagesMinimo(1);
      setTotalPagesVencimento(1);
      setCarregandoAlertas(false);
      return;
    }

    setCarregandoAlertas(true);
    try {
      const [minimo, vencimento] = await Promise.all([
        listarAlertasDashboardApi(
          {
            tipo: 'abaixo_minimo',
            origem: categoria || undefined,
            termo: debouncedBusca,
            pageNumber: pageMinimo,
            pageSize: itensPorPaginaAlertas,
          },
          unidadeAtivaId,
        ),
        listarAlertasDashboardApi(
          {
            tipo: 'proximo_vencimento',
            origem: categoria || undefined,
            termo: debouncedBusca,
            pageNumber: pageVencimento,
            pageSize: itensPorPaginaAlertas,
          },
          unidadeAtivaId,
        ),
      ]);

      setAlertasMinimo(minimo.items.map(mapearAlertaDashboardParaLinha));
      setTotalMinimo(minimo.totalCount);
      setTotalPagesMinimo(minimo.totalPages > 0 ? minimo.totalPages : 1);

      setAlertasVencimento(vencimento.items.map(mapearAlertaDashboardParaLinha));
      setTotalVencimento(vencimento.totalCount);
      setTotalPagesVencimento(vencimento.totalPages > 0 ? vencimento.totalPages : 1);
    } catch {
      setAlertasMinimo([]);
      setAlertasVencimento([]);
      setTotalMinimo(0);
      setTotalVencimento(0);
      setTotalPagesMinimo(1);
      setTotalPagesVencimento(1);
    } finally {
      setCarregandoAlertas(false);
    }
  }, [unidadeAtivaId, categoria, debouncedBusca, pageMinimo, pageVencimento, itensPorPaginaAlertas]);

  useEffect(() => {
    void carregarAlertas();
  }, [carregarAlertas]);

  useEffect(() => {
    if (totalPagesMinimo > 0 && pageMinimo > totalPagesMinimo) {
      setPageMinimo(totalPagesMinimo);
    }
  }, [totalPagesMinimo, pageMinimo]);

  useEffect(() => {
    if (totalPagesVencimento > 0 && pageVencimento > totalPagesVencimento) {
      setPageVencimento(totalPagesVencimento);
    }
  }, [totalPagesVencimento, pageVencimento]);

  function navegarComTransicao(rota: string) {
    setEmTransicao(true);
    window.setTimeout(() => {
      navigate(rota);
      setEmTransicao(false);
    }, 160);
  }

  function navegarParaDetalhe(item: LinhaOperacionalEstoque) {
    if (item.origem === 'produto') navigate(`/produtos/${item.id}`);
    else if (item.origem === 'medicamento') navigate(`/medicamentos/${item.id}`);
    else navigate(`/insumos/${item.id}`);
  }

  const rotuloVazioMinimo = useMemo(() => {
    if (totalMinimo === 0 && !debouncedBusca.trim() && !categoria) {
      return 'Nenhum item abaixo do nível mínimo no momento.';
    }
    if (debouncedBusca.trim()) return 'Nenhum item corresponde à busca.';
    if (categoria) return 'Nenhum item desta categoria abaixo do mínimo.';
    return 'Nenhum item abaixo do nível mínimo no momento.';
  }, [totalMinimo, debouncedBusca, categoria]);

  const rotuloVazioVencimento = useMemo(() => {
    if (totalVencimento === 0 && !debouncedBusca.trim() && !categoria) {
      return 'Nenhum item próximo do vencimento no momento.';
    }
    if (debouncedBusca.trim()) return 'Nenhum item corresponde à busca.';
    if (categoria) return 'Nenhum item desta categoria próximo do vencimento.';
    return 'Nenhum item próximo do vencimento no momento.';
  }, [totalVencimento, debouncedBusca, categoria]);

  const carregando = carregandoResumo || carregandoAlertas;

  return (
    <Box
      sx={{
        ...paddingPaginaShell,
        ...larguraConteudoPagina,
        backgroundColor: cores.bgConteudo,
        minHeight: '100%',
      }}
    >
      <Box sx={{ mb: SPACING.md }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
          Olá, {usuario?.primeiroNome ?? 'equipe'}
        </Typography>
        <Typography variant="body2" sx={{ color: cores.textSecondary }}>
          {ehMobileLayoutConteudo ? 'Operação de estoque' : 'Busca guiada e visão rápida do estoque'}
        </Typography>
      </Box>

      <MotionBox
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: emTransicao ? 0.7 : 1, y: 0 }}
        transition={{ duration: 0.32 }}
        sx={{ mt: SPACING.sm }}
      >
        <Stack spacing={SPACING.lg} sx={{ p: 0 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary, mb: SPACING.sm }}>
              Ações principais
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={SPACING.sm}>
              <Button
                variant="contained"
                startIcon={<Inventory2OutlinedIcon />}
                onClick={() => navegarComTransicao('/produtos/novo')}
                fullWidth
                sx={{
                  ...estilos.botaoPrimario,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    ...estilos.botaoPrimario['&:hover'],
                    transform: 'translateY(-2px)',
                    boxShadow: `0 10px 18px ${alpha(cores.accent, 0.28)}`,
                  },
                }}
              >
                Cadastrar Produtos
              </Button>
              <Button
                variant="contained"
                startIcon={<MedicalServicesOutlinedIcon />}
                onClick={() => navegarComTransicao('/medicamentos/novo')}
                fullWidth
                sx={{
                  ...estilos.botaoPrimario,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    ...estilos.botaoPrimario['&:hover'],
                    transform: 'translateY(-2px)',
                    boxShadow: `0 10px 18px ${alpha(cores.accent, 0.28)}`,
                  },
                }}
              >
                Cadastrar Medicamentos
              </Button>
              <Button
                variant="contained"
                startIcon={<ScienceOutlinedIcon />}
                onClick={() => navegarComTransicao('/insumos/novo')}
                fullWidth
                sx={{
                  ...estilos.botaoPrimario,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    ...estilos.botaoPrimario['&:hover'],
                    transform: 'translateY(-2px)',
                    boxShadow: `0 10px 18px ${alpha(cores.accent, 0.28)}`,
                  },
                }}
              >
                Cadastrar Insumos
              </Button>
            </Stack>
          </Box>

          <BuscaCategoriaTabs onSelecionarItem={navegarParaDetalhe} />

          {erroCarregamento ? <Alert severity="error">{erroCarregamento}</Alert> : null}

          <Box>
            <ResumoItensCadastrados
              carregando={carregandoResumo}
              totalItens={totalItens}
              contagemPorOrigem={contagemPorOrigem}
            />
          </Box>

          {!erroCarregamento ? (
            <Stack spacing={SPACING.md}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: cores.textPrimary, mb: 1 }}>
                  Alertas do estoque
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: { xs: 'stretch', sm: 'center' },
                    mb: 2,
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Buscar item..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    fullWidth
                    slotProps={{ htmlInput: { 'aria-label': 'Buscar nos alertas do estoque' } }}
                    sx={{
                      flex: { sm: '1 1 200px' },
                      maxWidth: { sm: 360 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        color: cores.textPrimary,
                        backgroundColor: cores.bgInput,
                        '& fieldset': { borderColor: cores.borderForte },
                        '&:hover fieldset': { borderColor: cores.focus },
                        '&.Mui-focused fieldset': { borderColor: cores.focus },
                      },
                      '& .MuiInputBase-input::placeholder': { color: cores.textMuted, opacity: 1 },
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                      flex: { sm: '1 1 auto' },
                    }}
                  >
                    {CHIPS_CATEGORIA_ALERTAS.map(({ valor, rotulo }) => (
                      <Chip
                        key={valor || 'todos'}
                        label={rotulo}
                        size="small"
                        clickable
                        color={categoria === valor ? 'primary' : 'default'}
                        variant={categoria === valor ? 'filled' : 'outlined'}
                        onClick={() => setCategoria(valor)}
                        sx={{
                          fontWeight: 600,
                          ...(categoria !== valor && {
                            color: cores.textPrimary,
                            borderColor: cores.borderForte,
                            bgcolor: cores.chipBg,
                          }),
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block' }}>
                  {totalMinimo} abaixo do mínimo · {totalVencimento} próx. do vencimento
                </Typography>
              </Box>
              <Grid container spacing={SPACING.md}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <AlertaCard
                    variante="abaixo_minimo"
                    titulo="Itens abaixo do mínimo"
                    descricao="Itens com quantidade abaixo do mínimo cadastrado."
                    itens={alertasMinimo}
                    totalFiltrado={totalMinimo}
                    page={pageMinimo}
                    totalPages={totalPagesMinimo}
                    onPageChange={setPageMinimo}
                    isMobile={ehMobileLayoutConteudo}
                    carregando={carregando}
                    vazioLabel={rotuloVazioMinimo}
                    onItemClick={navegarParaDetalhe}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <AlertaCard
                    variante="proximo_vencimento"
                    titulo="Próximo do vencimento"
                    descricao="Itens com validade em até 30 dias."
                    itens={alertasVencimento}
                    totalFiltrado={totalVencimento}
                    page={pageVencimento}
                    totalPages={totalPagesVencimento}
                    onPageChange={setPageVencimento}
                    isMobile={ehMobileLayoutConteudo}
                    carregando={carregando}
                    vazioLabel={rotuloVazioVencimento}
                    onItemClick={navegarParaDetalhe}
                  />
                </Grid>
              </Grid>
            </Stack>
          ) : null}
        </Stack>
      </MotionBox>
    </Box>
  );
}
