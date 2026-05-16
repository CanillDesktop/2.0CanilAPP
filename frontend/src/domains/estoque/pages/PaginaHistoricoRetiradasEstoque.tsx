import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import SearchIcon from '@mui/icons-material/Search';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { HistoricoRetiradasDetalheDrawer } from '../components/historicoRetiradas/HistoricoRetiradasDetalheDrawer';
import { HistoricoRetiradasStatusChip } from '../components/historicoRetiradas/HistoricoRetiradasStatusChip';
import { exportarRetiradasPaginaComoCsv } from '../components/historicoRetiradas/historicoRetiradasExport';
import { servicoEstoque } from '../services/servicoEstoque';
import { ErroApi } from '../../../infrastructure/http/erroApi';
import { listarUsuariosResumoParaRetiradasApi } from '../../usuarios/api/usuariosApi';
import type { UsuarioResumoFiltroDto } from '../../usuarios/types/tiposUsuarios';
import { useHistoricoRetiradasPaginado } from '../hooks/useHistoricoRetiradas';
import type { PeriodoRapidoRetiradasDto, RetiradaHistoricoFiltroDto, RetiradaHistoricoItemDto } from '../types/tiposEstoque';
import {
  fimDiaBrasiliaParaUtcInclusive,
  formatarFaixaPeriodoBrasilia,
  inicioDiaBrasiliaParaUtc,
  intervaloPadraoUltimosDiasBrasilia,
  rotuloFusoBrasilia,
} from '../../../shared/utils/fusoBrasilia';
import { HistoricoRetiradasCelulaData } from '../utils/historicoRetiradasDataFormat';

const sxCampoFiltro = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'rgba(2, 6, 23, 0.55)',
    color: '#e2e8f0',
    '& fieldset': { borderColor: 'rgba(148,163,184,0.25)' },
  },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiInputBase-input': { color: '#e2e8f0' },
  '& .MuiFormHelperText-root': { color: 'rgba(148,163,184,0.85)' },
};

const sxPaperFiltro = {
  bgcolor: '#0f172a',
  border: '1px solid rgba(148, 163, 184, 0.12)',
};

/** Cartão KPI compacto mantendo valores do backend intactos */
function KpiResumoAudit({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: ReactNode;
  destaque?: 'primary';
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: '1 1 180px',
        minWidth: 160,
        p: 1.6,
        borderRadius: 2,
        ...sxPaperFiltro,
        borderColor: destaque === 'primary' ? 'primary.main' : 'rgba(148, 163, 184, 0.12)',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 650, letterSpacing: 0.05, color: 'rgba(203, 213, 225, 0.85)' }}>
        {titulo}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.65, fontWeight: 750, color: '#e2e8f0' }}>
        {valor}
      </Typography>
    </Paper>
  );
}

export function PaginaHistoricoRetiradasEstoque() {
  const tema = useTheme();
  const { estado, carregar } = useHistoricoRetiradasPaginado();
  const [usuariosResumo, setUsuariosResumo] = useState<UsuarioResumoFiltroDto[]>([]);

  const [usarIntervaloLivre, setUsarIntervaloLivre] = useState(false);
  const [periodoRapido, setPeriodoRapido] = useState<PeriodoRapidoRetiradasDto>('ULTIMOS_30_DIAS');
  const [dataIni, setDataIni] = useState(() => intervaloPadraoUltimosDiasBrasilia(30).ini);
  const [dataFim, setDataFim] = useState(() => intervaloPadraoUltimosDiasBrasilia(30).fim);

  const [idRetirante, setIdRetirante] = useState<number | null>(null);
  const [idRecebedor, setIdRecebedor] = useState<number | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [termoDebounced, setTermoDebounced] = useState('');

  const [ordenacaoDataAsc, setOrdenacaoDataAsc] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  /** Linha ativa nos detalhes (drawer). */
  const [detalheSelecionado, setDetalheSelecionado] = useState<RetiradaHistoricoItemDto | null>(null);

  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setTermoDebounced(termoBusca), 360);
    return () => window.clearTimeout(t);
  }, [termoBusca]);

  useEffect(() => {
    void listarUsuariosResumoParaRetiradasApi()
      .then(setUsuariosResumo)
      .catch(() => setUsuariosResumo([]));
  }, []);

  useEffect(() => {
    setPage(0);
  }, [usarIntervaloLivre, periodoRapido, dataIni, dataFim, idRetirante, idRecebedor, termoDebounced, ordenacaoDataAsc]);

  const montarFiltro = useCallback((): RetiradaHistoricoFiltroDto | null => {
    if (usarIntervaloLivre) {
      if (!dataIni || !dataFim) return null;
      if (dataIni > dataFim) return null;
      return {
        dataInicioUtc: inicioDiaBrasiliaParaUtc(dataIni).toISOString(),
        dataFimUtc: fimDiaBrasiliaParaUtcInclusive(dataFim).toISOString(),
        idUsuarioRetirante: idRetirante ?? undefined,
        idUsuarioRecebedor: idRecebedor ?? undefined,
        termoBusca: termoDebounced.trim() || undefined,
      };
    }
    return {
      periodoRapido,
      idUsuarioRetirante: idRetirante ?? undefined,
      idUsuarioRecebedor: idRecebedor ?? undefined,
      termoBusca: termoDebounced.trim() || undefined,
    };
  }, [
    usarIntervaloLivre,
    dataIni,
    dataFim,
    periodoRapido,
    idRetirante,
    idRecebedor,
    termoDebounced,
  ]);

  const faixaTituloHumano = useMemo(() => {
    const d = estado.dados;
    if (!d) return null;
    return formatarFaixaPeriodoBrasilia(d.dataInicioUtcAplicada, d.dataFimUtcInclusiveAplicada);
  }, [estado.dados]);

  const recarregar = useCallback(async () => {
    const filtro = montarFiltro();
    if (!filtro) return;
    await carregar(filtro, {
      pageNumber: page + 1,
      pageSize: rowsPerPage,
      ordemDataAscendente: ordenacaoDataAsc,
    });
  }, [carregar, montarFiltro, page, rowsPerPage, ordenacaoDataAsc]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  useEffect(() => {
    const d = estado.dados;
    if (!d || d.totalPages <= 0) return;
    if (page > d.totalPages - 1) setPage(0);
  }, [estado.dados, page]);

  const metricas = estado.dados?.metricas;
  const dados = estado.dados;
  const itensPagina = dados?.items ?? [];
  const listaVazia = dados != null && dados.totalCount === 0 && !estado.carregando;
  const aguardandoPrimeiraResposta = dados == null && estado.carregando;
  const exibirEmpty = listaVazia;
  const exibirTabela = dados != null && !listaVazia;

  const fundoSticky = alpha('#020617', 0.94);

  const exportarRecorteCompleto = useCallback(
    async (formato: 'xlsx' | 'csv') => {
      const filtro = montarFiltro();
      if (!filtro) {
        setErroExportacao('Informe um período válido antes de exportar.');
        return;
      }
      if (listaVazia) return;

      setExportando(true);
      setErroExportacao(null);
      try {
        if (formato === 'xlsx') {
          await servicoEstoque.exportarHistoricoRetiradasXlsx(filtro, ordenacaoDataAsc);
        } else {
          await servicoEstoque.exportarHistoricoRetiradasCsv(filtro, ordenacaoDataAsc);
        }
      } catch (e) {
        const msg =
          e instanceof ErroApi
            ? e.message
            : 'Não foi possível gerar o arquivo. Tente novamente em instantes.';
        setErroExportacao(msg);
      } finally {
        setExportando(false);
      }
    },
    [montarFiltro, listaVazia, ordenacaoDataAsc],
  );

  return (
    <ShellComSidebar
      titulo="Histórico de retiradas"
      subtitulo="Auditoria para operação diária: filtros aplicados ao servidor • totais e lista sempre sincronizados."
    >
    <Box component="section" sx={{ pb: 4 }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: tema.zIndex.appBar - 1,
          backdropFilter: 'blur(12px)',
          backgroundColor: fundoSticky,
          borderBottom: 1,
          borderColor: 'divider',
          mx: -0.75,
          px: 0.75,
          pt: 0.75,
          pb: 1.75,
          mb: 2,
        }}
      >
        <Paper
          sx={{
            position: 'relative',
            p: 2.5,
            mb: metricas ? 2 : 0,
            borderRadius: 2,
            overflow: 'hidden',
            ...sxPaperFiltro,
          }}
        >
          {estado.carregando && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                borderRadius: '2px 2px 0 0',
              }}
            />
          )}
          <Stack spacing={2.2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={usarIntervaloLivre}
                    onChange={(_, c) => {
                      setUsarIntervaloLivre(c);
                      if (c) {
                        const { ini, fim } = intervaloPadraoUltimosDiasBrasilia(30);
                        setDataIni(ini);
                        setDataFim(fim);
                      }
                    }}
                  />
                }
                label={`Intervalo livre (${rotuloFusoBrasilia})`}
                sx={{ color: '#e2e8f0', '& .MuiFormControlLabel-label': { color: '#e2e8f0' } }}
              />
              {!usarIntervaloLivre && (
                <ToggleButtonGroup
                  exclusive
                  value={periodoRapido}
                  onChange={(_, v) => v != null && setPeriodoRapido(v)}
                  size="small"
                  sx={{
                    flexWrap: 'wrap',
                    '& .MuiToggleButton-root': {
                      color: '#94a3b8',
                      borderColor: 'rgba(148,163,184,0.25)',
                      '&.Mui-selected': {
                        color: '#e2e8f0',
                        bgcolor: 'rgba(59,130,246,0.2)',
                      },
                    },
                  }}
                >
                  <ToggleButton value="HOJE">Hoje</ToggleButton>
                  <ToggleButton value="ULTIMOS_7_DIAS">Últimos 7 dias</ToggleButton>
                  <ToggleButton value="ULTIMOS_30_DIAS">Últimos 30 dias</ToggleButton>
                </ToggleButtonGroup>
              )}
            </Stack>

            {faixaTituloHumano && (
              <Typography variant="caption" sx={{ color: 'rgba(203, 213, 225, 0.85)' }}>
                Período amostrado nesta consulta ({rotuloFusoBrasilia}): <strong>{faixaTituloHumano}</strong>. Os
                atalhos «Hoje» e «Últimos N dias» também seguem o calendário de Brasília.
              </Typography>
            )}

            {usarIntervaloLivre && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label={`Data inicial (${rotuloFusoBrasilia})`}
                  type="date"
                  size="small"
                  value={dataIni}
                  onChange={(e) => setDataIni(e.target.value)}
                  fullWidth
                  sx={sxCampoFiltro}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label={`Data final (${rotuloFusoBrasilia})`}
                  type="date"
                  size="small"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  fullWidth
                  sx={sxCampoFiltro}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
            )}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Autocomplete
                options={usuariosResumo}
                getOptionLabel={(o) => o.nomeExibicao}
                value={usuariosResumo.find((u) => u.id === idRetirante) ?? null}
                onChange={(_, v) => setIdRetirante(v?.id ?? null)}
                renderInput={(params) => (
                  <TextField {...params} label="Quem retirou" size="small" sx={sxCampoFiltro} />
                )}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Autocomplete
                options={usuariosResumo}
                getOptionLabel={(o) => o.nomeExibicao}
                value={usuariosResumo.find((u) => u.id === idRecebedor) ?? null}
                onChange={(_, v) => setIdRecebedor(v?.id ?? null)}
                renderInput={(params) => (
                  <TextField {...params} label="Destinatário (quem recebeu)" size="small" sx={sxCampoFiltro} />
                )}
                sx={{ flex: 1, minWidth: 200 }}
              />
            </Stack>

            <TextField
              size="small"
              label="Busca"
              placeholder="Buscar por ID, produto, lote, usuário ou observação..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              fullWidth
              sx={sxCampoFiltro}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ opacity: 0.65 }} />
                    </InputAdornment>
                  ),
                  endAdornment: estado.carregando ? (
                    <InputAdornment position="end">
                      <CircularProgress size={18} />
                    </InputAdornment>
                  ) : undefined,
                },
              }}
              helperText="A busca abrange código, nome, lote, retirante, destinatário, observações e IDs numéricos."
            />

            {usarIntervaloLivre && dataIni > dataFim && (
              <Alert severity="warning">A data inicial não pode ser maior que a data final.</Alert>
            )}
          </Stack>
        </Paper>

        {metricas && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, px: 0.25, color: '#e2e8f0' }}>
              Resumo (mesmos filtros da listagem abaixo)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <KpiResumoAudit titulo="Retiradas encontradas" valor={metricas.totalRegistrosNoRecorte} destaque="primary" />
              <KpiResumoAudit titulo="Quantidade total retirada" valor={metricas.somaQuantidadeItens} />
              {metricas.totalRetiradasFeitasPorUsuarioRetiranteFiltro != null && (
                <KpiResumoAudit
                  titulo="Retiradas feitas pelo filtro «quem retirou»"
                  valor={metricas.totalRetiradasFeitasPorUsuarioRetiranteFiltro}
                />
              )}
              {metricas.totalRetiradasRecebidasPorUsuarioRecebedorFiltro != null && (
                <KpiResumoAudit
                  titulo="Retiradas recebidas pelo filtro «destinatário»"
                  valor={metricas.totalRetiradasRecebidasPorUsuarioRecebedorFiltro}
                />
              )}
            </Box>

            {/* Box evita typings restritos do Stack neste projeto (`flexWrap`/`alignItems` como props). */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: 0.35, pb: 0.75 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Tooltip title="Exporta todas as retiradas do recorte filtrado (não só esta página), em planilha .xlsx formatada.">
                    <span>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={
                          exportando ? <CircularProgress size={16} color="inherit" /> : <TableViewOutlinedIcon />
                        }
                        disabled={listaVazia || exportando}
                        onClick={() => void exportarRecorteCompleto('xlsx')}
                      >
                        Exportar Excel (.xlsx)
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title="CSV completo do recorte filtrado — indicado para integrações externas.">
                    <span>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadOutlinedIcon />}
                        disabled={listaVazia || exportando}
                        onClick={() => void exportarRecorteCompleto('csv')}
                      >
                        CSV (recorte completo)
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title="CSV apenas dos registros visíveis nesta página (integração rápida).">
                    <span>
                      <Button
                        size="small"
                        variant="text"
                        disabled={itensPagina.length === 0 || exportando}
                        onClick={() => exportarRetiradasPaginaComoCsv(itensPagina)}
                      >
                        CSV (página atual)
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
                {erroExportacao && (
                  <Alert severity="warning" onClose={() => setErroExportacao(null)} sx={{ py: 0 }}>
                    {erroExportacao}
                  </Alert>
                )}
              </Box>
            </Box>
          </Stack>
        )}
      </Box>

      {estado.erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {estado.erro}
        </Alert>
      )}

      {aguardandoPrimeiraResposta && (
        <Paper sx={{ borderRadius: 2, p: 6, textAlign: 'center', ...sxPaperFiltro }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Carregando retiradas do servidor…
          </Typography>
        </Paper>
      )}

      {exibirEmpty ? (
        <Paper
          sx={{
            borderRadius: 2,
            textAlign: 'center',
            py: 10,
            px: 2,
            ...sxPaperFiltro,
            bgcolor: alpha(tema.palette.primary.main, 0.08),
          }}
        >
          <InboxOutlinedIcon sx={{ fontSize: 64, mb: 1.75, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Nenhuma retirada encontrada para os filtros aplicados.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Amplie o intervalo ou ajuste filtros como destinatários e texto de busca.
          </Typography>
        </Paper>
      ) : exibirTabela ? (
        <Box sx={{ position: 'relative' }}>
          {estado.carregando && dados != null && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 3,
              }}
            />
          )}
          <TableContainer component={Paper} sx={{ borderRadius: 2, ...sxPaperFiltro }}>
            <Table size="medium" stickyHeader>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: tema.palette.background.paper } }}>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: 72 }}>
                    ID
                  </TableCell>
                  <TableCell sortDirection={ordenacaoDataAsc ? 'asc' : 'desc'} sx={{ minWidth: 160 }}>
                    <TableSortLabel
                      active
                      direction={ordenacaoDataAsc ? 'asc' : 'desc'}
                      onClick={() => setOrdenacaoDataAsc((v) => !v)}
                      sx={{ '& .MuiTableSortLabel-icon': { ml: -0.5 } }}
                    >
                      Data e horário
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>Produto</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Lote</TableCell>
                  <TableCell align="right">Qtd</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Retirou</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Recebeu</TableCell>
                  <TableCell
                    sx={{ display: { xs: 'none', md: 'table-cell' }, maxWidth: 200 }}
                  >
                    Observação
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itensPagina.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    tabIndex={0}
                    role="button"
                    selected={detalheSelecionado?.id === r.id}
                    onClick={() => setDetalheSelecionado(r)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setDetalheSelecionado(r);
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      transition: tema.transitions.create(['background-color', 'transform'], {
                        duration: tema.transitions.duration.shortest,
                      }),
                      '&:hover': { bgcolor: alpha(tema.palette.primary.main, 0.065) },
                    }}
                  >
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{r.id}</TableCell>
                    <TableCell>
                      <HistoricoRetiradasCelulaData iso={r.dataHoraRetirada} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
                        {r.nomeProduto}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Cód. {r.codigo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' } }}>
                        Ref. #{r.id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontVariantNumeric: 'tabular-nums' }}>
                      {r.lote}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 820, fontSize: '1rem', letterSpacing: 0.2 }} component="span">
                        {r.quantidade}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', lg: 'none' } }}>
                        unid.
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      <Typography variant="body2">{r.usuarioRetiranteExibicao}</Typography>
                      {r.idUsuarioRetirante != null && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          ID usuário {r.idUsuarioRetirante}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      <Typography variant="body2">{r.usuarioRecebedorExibicao}</Typography>
                      {r.idUsuarioRecebedor != null && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          ID usuário {r.idUsuarioRecebedor}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, maxWidth: 220 }}>
                      <Tooltip title={r.observacao?.trim() ? r.observacao : '—'} placement="top-start">
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ opacity: r.observacao?.trim().length ? 1 : 0.45 }}
                        >
                          {r.observacao?.trim().length ? r.observacao : '—'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <HistoricoRetiradasStatusChip status={r.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Detalhes">
                        <IconButton
                          aria-label={`Detalhes da retirada ${r.id}`}
                          edge="end"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetalheSelecionado(r);
                          }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ mb: -0.01 }} />

          <TablePagination
            component={Paper}
            elevation={2}
            rowsPerPageOptions={[10, 20, 50, 100]}
            count={estado.dados?.totalCount ?? 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Linhas por página"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : 'mais de ' + to}`
            }
            sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
          />

          {/* Em telas pequenas, use o drawer para todas as informações */}
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', lg: 'none' }, mt: 1 }}>
            Algumas colunas ficam apenas em telas maiores para manter margem útil ao operador. Toque uma linha para ver
            tudo no painel de detalhes.
          </Typography>
        </Box>
      ) : null}

      <HistoricoRetiradasDetalheDrawer aberto={detalheSelecionado} aoFechar={() => setDetalheSelecionado(null)} />
    </Box>
    </ShellComSidebar>
  );
}
