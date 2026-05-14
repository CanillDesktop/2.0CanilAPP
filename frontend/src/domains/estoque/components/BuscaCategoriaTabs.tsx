import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBuscaCategoria, type CategoriaBusca } from '../hooks/useBuscaCategoria';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';
import { corChipStatus, rotuloStatusEstoque } from '../utils/estoqueStatusUi';

const ITENS_POR_PAGINA_BUSCA = 6;

const categorias: { id: CategoriaBusca; label: string; placeholder: string }[] = [
  { id: 'produto', label: 'Produtos', placeholder: 'Buscar produto...' },
  { id: 'medicamento', label: 'Medicamentos', placeholder: 'Buscar medicamento...' },
  { id: 'insumo', label: 'Insumos', placeholder: 'Buscar insumo...' },
];

type Props = {
  itens: LinhaOperacionalEstoque[];
  onSelecionarItem: (item: LinhaOperacionalEstoque) => void;
};

type FiltrosAvancadosBusca = {
  qtdMin: string;
  qtdMax: string;
  validadeInicio: string;
  validadeFim: string;
  movInicio: string;
  movFim: string;
  status: '' | 'ok' | 'baixo' | 'critico' | 'vencimento';
};

const FILTROS_AVANCADOS_INICIAL: FiltrosAvancadosBusca = {
  qtdMin: '',
  qtdMax: '',
  validadeInicio: '',
  validadeFim: '',
  movInicio: '',
  movFim: '',
  status: '',
};

function inicioDiaUtc(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00`).getTime();
}

function fimDiaUtc(isoDate: string): number {
  return new Date(`${isoDate}T23:59:59.999`).getTime();
}

function aplicarFiltrosAvancadosBusca(
  lista: LinhaOperacionalEstoque[],
  f: FiltrosAvancadosBusca,
): LinhaOperacionalEstoque[] {
  const minQ = f.qtdMin.trim() === '' ? null : Number(f.qtdMin);
  const maxQ = f.qtdMax.trim() === '' ? null : Number(f.qtdMax);
  const vIni = f.validadeInicio ? inicioDiaUtc(f.validadeInicio) : null;
  const vFim = f.validadeFim ? fimDiaUtc(f.validadeFim) : null;
  const mIni = f.movInicio ? inicioDiaUtc(f.movInicio) : null;
  const mFim = f.movFim ? fimDiaUtc(f.movFim) : null;

  const statusAlvo =
    f.status === '' ? null : f.status === 'vencimento' ? ('proximo_vencimento' as const) : f.status;

  return lista.filter((item) => {
    if (minQ !== null && !Number.isNaN(minQ) && item.quantidade < minQ) return false;
    if (maxQ !== null && !Number.isNaN(maxQ) && item.quantidade > maxQ) return false;
    if (statusAlvo !== null && item.status !== statusAlvo) return false;

    if (vIni !== null || vFim !== null) {
      const ms = item.validadeMs;
      if (ms == null) return false;
      if (vIni !== null && ms < vIni) return false;
      if (vFim !== null && ms > vFim) return false;
    }

    if (mIni !== null || mFim !== null) {
      const ms = item.movimentacaoMs;
      if (ms == null) return false;
      if (mIni !== null && ms < mIni) return false;
      if (mFim !== null && ms > mFim) return false;
    }

    return true;
  });
}

const sxCampoFiltroAvancado = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    color: '#e2e8f0',
    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
    '&:hover fieldset': { borderColor: 'rgba(96, 165, 250, 0.45)' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
  },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#93c5fd' },
  '& .MuiInputBase-input': { color: '#e2e8f0' },
} as const;

function nivelPercentual(item: LinhaOperacionalEstoque): number {
  if (item.minimo <= 0) return item.quantidade > 0 ? 100 : 0;
  return Math.min(100, Math.round((item.quantidade / item.minimo) * 100));
}

function corBarraNivel(item: LinhaOperacionalEstoque): 'success' | 'warning' | 'error' | 'inherit' {
  if (item.status === 'critico' || item.quantidade <= 0) return 'error';
  if (item.status === 'baixo') return 'warning';
  if (item.status === 'proximo_vencimento') return 'warning';
  return 'success';
}

type PreviewProps = {
  item: LinhaOperacionalEstoque;
  categoriaLabel: (origem: LinhaOperacionalEstoque['origem']) => string;
  onVerDetalhes: () => void;
  onRegistrarRetirada: () => void;
  mostrarCabecalhoDrawer?: boolean;
  onFecharDrawer?: () => void;
};

function PainelPreviewItem({
  item,
  categoriaLabel,
  onVerDetalhes,
  onRegistrarRetirada,
  mostrarCabecalhoDrawer,
  onFecharDrawer,
}: PreviewProps) {
  const pct = nivelPercentual(item);
  const corBarra = corBarraNivel(item);

  return (
    <Stack spacing={2.5}>
      {mostrarCabecalhoDrawer ? (
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.06 }}>
            Inspeção rápida
          </Typography>
          <IconButton
            size="small"
            onClick={onFecharDrawer}
            aria-label="Fechar painel"
            sx={{ color: '#e2e8f0' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      ) : null}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3, flex: '1 1 160px' }}>
          {item.nome}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Chip label={categoriaLabel(item.origem)} size="small" variant="outlined" sx={{ borderColor: 'rgba(148,163,184,0.45)', color: '#e2e8f0' }} />
          <Chip label={rotuloStatusEstoque(item.status)} color={corChipStatus(item.status)} size="small" sx={{ fontWeight: 700 }} />
        </Stack>
      </Box>

      <Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            Nível em relação ao mínimo
          </Typography>
          <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 700 }}>
            {pct}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={pct}
          color={corBarra}
          sx={{
            height: 8,
            borderRadius: 999,
            bgcolor: 'rgba(30, 41, 59, 0.9)',
            '& .MuiLinearProgress-bar': { borderRadius: 999 },
          }}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.35 }}>
            Quantidade
          </Typography>
          <Typography sx={{ color: '#f1f5f9', fontWeight: 700 }}>{item.quantidade}</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.35 }}>
            Mínimo
          </Typography>
          <Typography sx={{ color: '#f1f5f9', fontWeight: 700 }}>{item.minimo}</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.35 }}>
            Validade
          </Typography>
          <Typography sx={{ color: '#e2e8f0', fontWeight: 600 }}>{item.validade}</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.35 }}>
            Última mov.
          </Typography>
          <Typography sx={{ color: '#e2e8f0', fontWeight: 600 }}>{item.ultimaMovimentacao}</Typography>
        </Grid>
      </Grid>

      {item.status === 'baixo' ? (
        <Alert severity="warning" sx={{ bgcolor: 'rgba(113, 63, 18, 0.2)', color: '#fde68a', '& .MuiAlert-icon': { color: '#fbbf24' } }}>
          Estoque abaixo do mínimo
        </Alert>
      ) : null}
      {item.status === 'proximo_vencimento' ? (
        <Alert severity="error" sx={{ bgcolor: 'rgba(127, 29, 29, 0.2)', color: '#fecaca', '& .MuiAlert-icon': { color: '#f87171' } }}>
          Item próximo do vencimento
        </Alert>
      ) : null}
      {item.status === 'critico' ? (
        <Alert severity="error" sx={{ bgcolor: 'rgba(127, 29, 29, 0.25)', color: '#fecaca', '& .MuiAlert-icon': { color: '#f87171' } }}>
          Estoque crítico ou zerado
        </Alert>
      ) : null}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 0.5 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onVerDetalhes}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            backgroundColor: '#2563eb',
            '&:hover': { backgroundColor: '#1d4ed8' },
          }}
        >
          Ver detalhes
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={onRegistrarRetirada}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderColor: 'rgba(148,163,184,0.45)',
            color: '#e2e8f0',
            '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(59,130,246,0.08)' },
          }}
        >
          Registrar retirada
        </Button>
      </Box>
      <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.85)', display: 'block' }}>
        A retirada é feita por lote na ficha do item.
      </Typography>
    </Stack>
  );
}

function EmptyPreview() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 280,
        height: '100%',
        opacity: 0.72,
        gap: 1,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 700 }}>
        Nenhum item selecionado
      </Typography>
      <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 360 }}>
        Selecione um item à esquerda para visualizar detalhes e ações rápidas.
      </Typography>
    </Box>
  );
}

export function BuscaCategoriaTabs({ itens, onSelecionarItem }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const ehMobilePaginacao = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState<CategoriaBusca>('produto');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const listaTopoRef = useRef<HTMLDivElement | null>(null);
  const { searchTerm, setSearchTerm, resultados, termoNomeDebounced } = useBuscaCategoria(itens, selectedTab);
  const [filtrosAvancados, setFiltrosAvancados] = useState<FiltrosAvancadosBusca>(FILTROS_AVANCADOS_INICIAL);

  useEffect(() => {
    setSearchTerm('');
    setSelectedItemId(null);
    setDrawerAberto(false);
    setFiltrosAvancados(FILTROS_AVANCADOS_INICIAL);
    setPaginaAtual(1);
  }, [selectedTab, setSearchTerm]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoNomeDebounced, filtrosAvancados]);

  const resultadosFiltrados = useMemo(
    () => aplicarFiltrosAvancadosBusca(resultados, filtrosAvancados),
    [resultados, filtrosAvancados],
  );

  const temFiltroAvancadoAtivo = useMemo(
    () =>
      Boolean(
        filtrosAvancados.qtdMin ||
          filtrosAvancados.qtdMax ||
          filtrosAvancados.validadeInicio ||
          filtrosAvancados.validadeFim ||
          filtrosAvancados.movInicio ||
          filtrosAvancados.movFim ||
          filtrosAvancados.status,
      ),
    [filtrosAvancados],
  );

  useEffect(() => {
    if (selectedItemId == null) return;
    if (!resultadosFiltrados.some((i) => i.id === selectedItemId)) {
      setSelectedItemId(null);
      setDrawerAberto(false);
    }
  }, [resultadosFiltrados, selectedItemId]);

  const categoriaAtual = useMemo(
    () => categorias.find((categoria) => categoria.id === selectedTab) ?? categorias[0],
    [selectedTab],
  );

  const totalPaginas = useMemo(() => {
    if (resultadosFiltrados.length === 0) return 1;
    return Math.ceil(resultadosFiltrados.length / ITENS_POR_PAGINA_BUSCA);
  }, [resultadosFiltrados.length]);

  const paginaSegura = Math.min(Math.max(1, paginaAtual), totalPaginas);

  const itensPaginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * ITENS_POR_PAGINA_BUSCA;
    return resultadosFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA_BUSCA);
  }, [resultadosFiltrados, paginaSegura]);

  useEffect(() => {
    if (paginaSegura !== paginaAtual) {
      setPaginaAtual(paginaSegura);
    }
  }, [paginaSegura, paginaAtual]);

  useEffect(() => {
    listaTopoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [paginaSegura]);

  const mostrarVazio =
    resultadosFiltrados.length === 0 &&
    (resultados.length > 0 || Boolean(termoNomeDebounced) || temFiltroAvancadoAtivo);
  const itemSelecionado = resultadosFiltrados.find((item) => item.id === selectedItemId) ?? null;

  function categoriaLabel(categoria: LinhaOperacionalEstoque['origem']) {
    if (categoria === 'produto') return 'Produto';
    if (categoria === 'medicamento') return 'Medicamento';
    return 'Insumo';
  }

  function selecionarItemLista(item: LinhaOperacionalEstoque) {
    setSelectedItemId(item.id);
    if (isMobile) {
      setDrawerAberto(true);
    }
  }

  function renderLista() {
    return (
      <Stack spacing={2}>
        <Tabs
          value={selectedTab}
          onChange={(_, value: CategoriaBusca) => setSelectedTab(value)}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: 3 },
            '& .MuiTab-root': { color: '#94a3b8', textTransform: 'none', fontWeight: 600 },
            '& .Mui-selected': { color: '#e2e8f0' },
          }}
        >
          {categorias.map((categoria) => (
            <Tab key={categoria.id} value={categoria.id} label={categoria.label} />
          ))}
        </Tabs>

        <TextField
          fullWidth
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={categoriaAtual.placeholder}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(2, 6, 23, 0.65)',
              color: '#e2e8f0',
              '& fieldset': { borderColor: 'rgba(59,130,246,0.35)' },
              '&:hover fieldset': { borderColor: '#3b82f6' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            },
            '& .MuiInputBase-input::placeholder': { color: '#94a3b8', opacity: 1 },
          }}
          slotProps={{
            input: {
              startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: '#94a3b8' }} />,
            },
          }}
        />

        <Accordion
          defaultExpanded={false}
          disableGutters
          elevation={0}
          sx={{
            bgcolor: 'rgba(2, 6, 23, 0.45)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 2,
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#94a3b8' }} />}
            sx={{ minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 600, color: '#e2e8f0' }}>Filtros avançados</Typography>
              {temFiltroAvancadoAtivo ? (
                <Chip label="Ativos" size="small" color="primary" sx={{ height: 22, fontWeight: 700 }} />
              ) : null}
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Qtd mín"
                  type="number"
                  value={filtrosAvancados.qtdMin}
                  onChange={(e) => setFiltrosAvancados((p) => ({ ...p, qtdMin: e.target.value }))}
                  slotProps={{ htmlInput: { min: 0 } }}
                  sx={sxCampoFiltroAvancado}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Qtd máx"
                  type="number"
                  value={filtrosAvancados.qtdMax}
                  onChange={(e) => setFiltrosAvancados((p) => ({ ...p, qtdMax: e.target.value }))}
                  slotProps={{ htmlInput: { min: 0 } }}
                  sx={sxCampoFiltroAvancado}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Validade de"
                  type="date"
                  value={filtrosAvancados.validadeInicio}
                  onChange={(e) => setFiltrosAvancados((p) => ({ ...p, validadeInicio: e.target.value }))}
                  slotProps={{ htmlInput: { lang: 'pt-BR' }, inputLabel: { shrink: true } }}
                  sx={sxCampoFiltroAvancado}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Validade até"
                  type="date"
                  value={filtrosAvancados.validadeFim}
                  onChange={(e) => setFiltrosAvancados((p) => ({ ...p, validadeFim: e.target.value }))}
                  slotProps={{ htmlInput: { lang: 'pt-BR' }, inputLabel: { shrink: true } }}
                  sx={sxCampoFiltroAvancado}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mov. de"
                  type="date"
                  value={filtrosAvancados.movInicio}
                  onChange={(e) => setFiltrosAvancados((p) => ({ ...p, movInicio: e.target.value }))}
                  slotProps={{ htmlInput: { lang: 'pt-BR' }, inputLabel: { shrink: true } }}
                  sx={sxCampoFiltroAvancado}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mov. até"
                  type="date"
                  value={filtrosAvancados.movFim}
                  onChange={(e) => setFiltrosAvancados((p) => ({ ...p, movFim: e.target.value }))}
                  slotProps={{ htmlInput: { lang: 'pt-BR' }, inputLabel: { shrink: true } }}
                  sx={sxCampoFiltroAvancado}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small" sx={sxCampoFiltroAvancado}>
                  <InputLabel id="busca-cat-status-label" shrink>
                    Status
                  </InputLabel>
                  <Select
                    labelId="busca-cat-status-label"
                    label="Status"
                    notched
                    value={filtrosAvancados.status}
                    onChange={(e) =>
                      setFiltrosAvancados((p) => ({
                        ...p,
                        status: e.target.value as FiltrosAvancadosBusca['status'],
                      }))
                    }
                    sx={{ borderRadius: 2, color: '#e2e8f0', '& .MuiSvgIcon-root': { color: '#94a3b8' } }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="ok">OK</MenuItem>
                    <MenuItem value="baixo">Baixo</MenuItem>
                    <MenuItem value="critico">Crítico</MenuItem>
                    <MenuItem value="vencimento">Próx. vencimento</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              size="small"
              variant="text"
              onClick={() => setFiltrosAvancados(FILTROS_AVANCADOS_INICIAL)}
              sx={{ mt: 2, color: '#93c5fd', textTransform: 'none', fontWeight: 700 }}
            >
              Limpar filtros
            </Button>
          </AccordionDetails>
        </Accordion>

        <Box ref={listaTopoRef} sx={{ scrollMarginTop: 8 }} />

        <Stack spacing={1}>
          {mostrarVazio ? (
            <Typography variant="body2" sx={{ color: '#94a3b8', py: 1 }}>
              Nenhum item encontrado.
            </Typography>
          ) : (
            itensPaginados.map((item) => {
              const selecionado = item.id === selectedItemId;
              return (
                <Box
                  key={`${item.origem}-${item.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => selecionarItemLista(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      selecionarItemLista(item);
                    }
                  }}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: selecionado ? '1px solid #3b82f6' : '1px solid rgba(71, 85, 105, 0.45)',
                    backgroundColor: selecionado ? '#1e293b' : 'rgba(2, 6, 23, 0.55)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: selecionado ? '#1e293b' : 'rgba(255,255,255,0.03)',
                      borderColor: selecionado ? '#3b82f6' : 'rgba(59,130,246,0.6)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.28)',
                    },
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ color: '#e2e8f0', fontWeight: 600 }}>{item.nome}</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                      {categoriaLabel(item.origem)}
                    </Typography>
                  </Stack>
                </Box>
              );
            })
          )}
        </Stack>

        {!mostrarVazio && totalPaginas > 1 ? (
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {resultadosFiltrados.length} {resultadosFiltrados.length === 1 ? 'item' : 'itens'} · página {paginaSegura} de{' '}
              {totalPaginas}
            </Typography>
            <Pagination
              count={totalPaginas}
              page={paginaSegura}
              onChange={(_e, value) => setPaginaAtual(value)}
              size={ehMobilePaginacao ? 'small' : 'medium'}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': { color: '#e2e8f0' },
                '& .Mui-selected': { bgcolor: 'rgba(59, 130, 246, 0.35)' },
              }}
            />
          </Box>
        ) : null}
      </Stack>
    );
  }

  function irParaDetalhe(item: LinhaOperacionalEstoque) {
    onSelecionarItem(item);
    if (isMobile) {
      setDrawerAberto(false);
    }
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0', textAlign: 'center', mb: 0.5 }}>
            Busca por categoria
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'center' }}>
            Selecione a categoria e pesquise pelo nome.
          </Typography>
        </Box>
        {isMobile ? (
          <Box>
            {renderLista()}
            <Drawer
              anchor="right"
              open={drawerAberto && !!itemSelecionado}
              onClose={() => setDrawerAberto(false)}
              slotProps={{
                paper: {
                  sx: {
                    width: '100%',
                    maxWidth: 420,
                    backgroundColor: '#0f172a',
                    borderLeft: '1px solid rgba(148,163,184,0.2)',
                    p: 3,
                  },
                },
              }}
            >
              {itemSelecionado ? (
                <PainelPreviewItem
                  item={itemSelecionado}
                  categoriaLabel={categoriaLabel}
                  onVerDetalhes={() => irParaDetalhe(itemSelecionado)}
                  onRegistrarRetirada={() => irParaDetalhe(itemSelecionado)}
                  mostrarCabecalhoDrawer
                  onFecharDrawer={() => setDrawerAberto(false)}
                />
              ) : null}
            </Drawer>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>{renderLista()}</Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: 360,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(148,163,184,0.16)',
                }}
              >
                {itemSelecionado ? (
                  <PainelPreviewItem
                    item={itemSelecionado}
                    categoriaLabel={categoriaLabel}
                    onVerDetalhes={() => irParaDetalhe(itemSelecionado)}
                    onRegistrarRetirada={() => irParaDetalhe(itemSelecionado)}
                  />
                ) : (
                  <EmptyPreview />
                )}
              </Card>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Box>
  );
}
