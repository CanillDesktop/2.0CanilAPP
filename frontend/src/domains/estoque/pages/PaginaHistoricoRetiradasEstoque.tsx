import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { HistoricoRetiradasDetalheDrawer } from '../components/historicoRetiradas/HistoricoRetiradasDetalheDrawer';
import { HistoricoRetiradasListaConteudo } from '../components/historicoRetiradas/HistoricoRetiradasListaConteudo';
import {
  contarFiltrosHistoricoRetiradasAtivos,
  PainelFiltrosHistoricoRetiradas,
} from '../components/historicoRetiradas/PainelFiltrosHistoricoRetiradas';
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
} from '../../../shared/utils/fusoBrasilia';

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
  const { cores } = useTemaApp();
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: '1 1 180px',
        minWidth: 160,
        p: 1.6,
        borderRadius: 2,
        bgcolor: cores.metricCardBg,
        border: `1px solid ${destaque === 'primary' ? cores.accent : cores.metricCardBorder}`,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 650, letterSpacing: 0.05, color: cores.textSecondary }}>
        {titulo}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.65, fontWeight: 750, color: cores.textPrimary }}>
        {valor}
      </Typography>
    </Paper>
  );
}

export function PaginaHistoricoRetiradasEstoque() {
  const tema = useTheme();
  const { cores } = useTemaApp();
  const estilos = useEstilosListagem();
  const sxPaperFiltro = {
    bgcolor: cores.bgCard,
    border: `1px solid ${cores.border}`,
  };
  const { estado, carregar } = useHistoricoRetiradasPaginado();
  const [usuariosResumo, setUsuariosResumo] = useState<UsuarioResumoFiltroDto[]>([]);
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false);

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

  const filtrosAtivos = useMemo(
    () =>
      contarFiltrosHistoricoRetiradasAtivos({
        usarIntervaloLivre,
        periodoRapido,
        idRetirante,
        idRecebedor,
        termoBusca,
      }),
    [usarIntervaloLivre, periodoRapido, idRetirante, idRecebedor, termoBusca],
  );

  function aoAlternarIntervaloLivre(ativo: boolean) {
    setUsarIntervaloLivre(ativo);
    if (ativo) {
      const { ini, fim } = intervaloPadraoUltimosDiasBrasilia(30);
      setDataIni(ini);
      setDataFim(fim);
    }
  }

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

  const fundoSticky = alpha(cores.bgShell, 0.94);

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
          borderColor: cores.border,
          pt: 0.75,
          pb: 1.75,
          mb: 2,
        }}
      >
        <Card sx={{ ...estilos.cardTabela, p: { xs: 2, sm: 2.5 }, mb: metricas ? 2 : 0, position: 'relative', overflow: 'hidden' }}>
          {estado.carregando && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                borderRadius: '12px 12px 0 0',
              }}
            />
          )}
          <PainelFiltrosHistoricoRetiradas
            expandido={filtrosExpandidos}
            onExpandidoChange={setFiltrosExpandidos}
            carregando={estado.carregando}
            usarIntervaloLivre={usarIntervaloLivre}
            onUsarIntervaloLivreChange={aoAlternarIntervaloLivre}
            periodoRapido={periodoRapido}
            onPeriodoRapidoChange={setPeriodoRapido}
            dataIni={dataIni}
            onDataIniChange={setDataIni}
            dataFim={dataFim}
            onDataFimChange={setDataFim}
            idRetirante={idRetirante}
            onIdRetiranteChange={setIdRetirante}
            idRecebedor={idRecebedor}
            onIdRecebedorChange={setIdRecebedor}
            termoBusca={termoBusca}
            onTermoBuscaChange={setTermoBusca}
            usuariosResumo={usuariosResumo}
            faixaTituloHumano={faixaTituloHumano}
            filtrosAtivos={filtrosAtivos}
          />
        </Card>

        {metricas && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, px: 0.25, color: cores.textPrimary }}>
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
                        sx={{ borderColor: cores.borderForte, color: cores.textPrimary }}
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
                        sx={{ color: cores.focus }}
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
          <Typography variant="body2" sx={{ mt: 2, color: cores.textSecondary }}>
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
            bgcolor: cores.metricCardBg,
          }}
        >
          <InboxOutlinedIcon sx={{ fontSize: 64, mb: 1.75, opacity: 0.5, color: cores.textMuted }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
            Nenhuma retirada encontrada para os filtros aplicados.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: cores.textSecondary }}>
            Amplie o intervalo ou ajuste filtros como destinatários e texto de busca.
          </Typography>
        </Paper>
      ) : exibirTabela ? (
        <HistoricoRetiradasListaConteudo
          itens={itensPagina}
          totalCount={estado.dados?.totalCount ?? 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setPage(0);
          }}
          ordenacaoDataAsc={ordenacaoDataAsc}
          onToggleOrdenacaoData={() => setOrdenacaoDataAsc((v) => !v)}
          selecionadoId={detalheSelecionado?.id ?? null}
          onSelecionar={setDetalheSelecionado}
          carregando={estado.carregando && dados != null}
          sxPaper={sxPaperFiltro}
        />
      ) : null}

      <HistoricoRetiradasDetalheDrawer aberto={detalheSelecionado} aoFechar={() => setDetalheSelecionado(null)} />
    </Box>
    </ShellComSidebar>
  );
}
