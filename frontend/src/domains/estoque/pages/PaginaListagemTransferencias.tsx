import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';
import { ErroApi } from '../../../infrastructure/http/erroApi';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import {
  exportarTransferenciasCsvApi,
  exportarTransferenciasXlsxApi,
} from '../api/transferenciasEstoqueApi';
import { useTransferenciasEstoque } from '../hooks/useTransferencias';
import { TransferenciaDetalheDrawer } from '../components/TransferenciaDetalheDrawer';
import type { TransferenciaEstoqueLeituraDto } from '../types/tiposTransferencia';

const ROWS_POR_PAGINA_PADRAO = 10;

function transferenciaPendente(status: string) {
  return status.toLowerCase().includes('pend') || status.toUpperCase() === 'ENVIADA';
}

function ehEntrada(tipoMovimento: string) {
  return tipoMovimento.trim().toLowerCase() === 'entrada';
}

function rotuloDestino(nome?: string | null) {
  return nome?.trim() ? nome : 'Sem destino';
}

function rotuloResponsavel(t: TransferenciaEstoqueLeituraDto) {
  return t.responsavelEnvio?.trim() || t.usuarioEnvio || '—';
}

function rotuloTipoMovimento(tipoMovimento: string) {
  return ehEntrada(tipoMovimento) ? 'Entrada' : 'Saída';
}

export function PaginaListagemTransferencias() {
  const { cores } = useTemaApp();
  const estilos = useEstilosListagem();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { permissoesAtivas, unidadeAtivaId, contexto } = useUnidadeEstoque();
  const { lista, carregando, salvando, erro, carregar, receber } = useTransferenciasEstoque();
  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_POR_PAGINA_PADRAO);
  const [detalheSelecionado, setDetalheSelecionado] = useState<TransferenciaEstoqueLeituraDto | null>(null);

  const nomeUnidadeAtiva =
    contexto?.unidadesDisponiveis.find((u) => u.id === unidadeAtivaId)?.nome ??
    contexto?.unidadeAtivaNome ??
    'unidade atual';

  useEffect(() => {
    if (unidadeAtivaId == null) return;
    void carregar();
  }, [carregar, unidadeAtivaId]);

  useEffect(() => {
    setPage(0);
  }, [lista.length, unidadeAtivaId]);

  const totalCount = lista.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage) || 1);
  const pageSegura = Math.min(page, Math.max(0, totalPages - 1));

  const itensPagina = useMemo(() => {
    const inicio = pageSegura * rowsPerPage;
    return lista.slice(inicio, inicio + rowsPerPage);
  }, [lista, pageSegura, rowsPerPage]);

  useEffect(() => {
    if (page !== pageSegura) setPage(pageSegura);
  }, [page, pageSegura]);

  async function confirmarRecebimento(id: number) {
    const ok = await receber(id);
    if (ok.ok) {
      setDetalheSelecionado(null);
      void carregar();
    }
  }

  function renderAcoes(t: TransferenciaEstoqueLeituraDto) {
    const pendente = transferenciaPendente(t.status);
    const entrada = ehEntrada(t.tipoMovimento);

    return (
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={0.75}
        sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 0.75, width: isMobile ? '100%' : 'auto' }}
      >
        {pendente && entrada && permissoesAtivas?.podeTransferirReceber ? (
          <Button
            size="small"
            fullWidth={isMobile}
            disabled={salvando}
            onClick={(e) => {
              e.stopPropagation();
              void confirmarRecebimento(t.id);
            }}
            sx={{ minHeight: { xs: 40, sm: 'auto' }, textTransform: 'none', fontWeight: 700 }}
          >
            Receber
          </Button>
        ) : null}
        <Button
          size="small"
          variant="outlined"
          fullWidth={isMobile}
          onClick={(e) => {
            e.stopPropagation();
            setDetalheSelecionado(t);
          }}
          sx={{
            minHeight: { xs: 40, sm: 'auto' },
            textTransform: 'none',
            fontWeight: 700,
            borderColor: cores.borderForte,
            color: cores.textPrimary,
          }}
        >
          Detalhes
        </Button>
      </Stack>
    );
  }

  const exportar = useCallback(async (formato: 'xlsx' | 'csv') => {
    setExportando(true);
    setErroExportacao(null);
    try {
      if (formato === 'xlsx') await exportarTransferenciasXlsxApi();
      else await exportarTransferenciasCsvApi();
    } catch (e) {
      const msg =
        e instanceof ErroApi
          ? e.message
          : 'Não foi possível gerar o arquivo. Tente novamente em instantes.';
      setErroExportacao(msg);
    } finally {
      setExportando(false);
    }
  }, []);

  function chipTipoMovimento(tipoMovimento: string) {
    const entrada = ehEntrada(tipoMovimento);
    return (
      <Chip
        size="small"
        label={rotuloTipoMovimento(tipoMovimento)}
        color={entrada ? 'success' : 'warning'}
        sx={{ fontWeight: 700 }}
      />
    );
  }

  const barraPaginacao =
    totalCount > 0 ? (
      <TablePagination
        component="div"
        sx={estilos.paginacao}
        rowsPerPageOptions={[5, 10, 25, 50]}
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={pageSegura}
        onPageChange={(_, novaPagina) => setPage(novaPagina)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(Number.parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Por página"
        labelDisplayedRows={({ from, to, count }) =>
          count === 0 ? '0–0 de 0' : `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />
    ) : null;

  const listaMobile = (
    <Stack spacing={1.25} sx={{ p: 1.5 }}>
      {itensPagina.map((t) => {
        const selecionado = detalheSelecionado?.id === t.id;
        return (
          <Card
            key={t.id}
            component="article"
            elevation={0}
            onClick={() => setDetalheSelecionado(t)}
            sx={{
              ...estilos.cardMobile,
              p: 0,
              cursor: 'pointer',
              borderColor: selecionado ? cores.focus : cores.border,
              bgcolor: selecionado ? cores.hoverSurfaceStrong : cores.bgCard,
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack spacing={1}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: cores.textPrimary }}>
                    #{t.id}
                  </Typography>
                  <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                    {chipTipoMovimento(t.tipoMovimento)}
                    <Chip size="small" label={t.status} sx={{ fontWeight: 700 }} />
                  </Stack>
                </Stack>
                <Typography variant="body2" sx={{ color: cores.textPrimary, fontWeight: 600, wordBreak: 'break-word' }}>
                  {t.unidadeOrigemNome} → {rotuloDestino(t.unidadeDestinoNome)}
                </Typography>
                <Typography variant="caption" sx={{ color: cores.textSecondary, display: 'block', wordBreak: 'break-word' }}>
                  Realizada por: {rotuloResponsavel(t)}
                  {t.responsavelRecebimento?.trim() ? ` · Recebimento informado: ${t.responsavelRecebimento}` : ''}
                </Typography>
                <Typography variant="caption" sx={{ color: cores.textMuted }}>
                  {new Date(t.dataTransferencia).toLocaleString('pt-BR')}
                </Typography>
                <Box>
                  {t.itens.map((i) => (
                    <Typography
                      key={`${i.idItem}-${i.lote}`}
                      variant="caption"
                      sx={{ display: 'block', color: cores.textSecondary, wordBreak: 'break-word' }}
                    >
                      {i.nomeItem} ({i.lote}) × {i.quantidade}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ pt: 0.25 }}>{renderAcoes(t)}</Box>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );

  const tabelaDesktop = (
    <Box sx={{ overflow: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Movimento</TableCell>
            <TableCell>Origem → Destino</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Itens</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itensPagina.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.id}</TableCell>
              <TableCell>{chipTipoMovimento(t.tipoMovimento)}</TableCell>
              <TableCell>
                {t.unidadeOrigemNome} → {rotuloDestino(t.unidadeDestinoNome)}
                <Typography variant="caption" sx={{ display: 'block', color: cores.textMuted }}>
                  {rotuloResponsavel(t)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip size="small" label={t.status} />
              </TableCell>
              <TableCell>{new Date(t.dataTransferencia).toLocaleString('pt-BR')}</TableCell>
              <TableCell>
                {t.itens.map((i) => (
                  <Typography key={`${i.idItem}-${i.lote}`} variant="caption" sx={{ display: 'block' }}>
                    {i.nomeItem} ({i.lote}) × {i.quantidade}
                  </Typography>
                ))}
              </TableCell>
              <TableCell align="right">{renderAcoes(t)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  const conteudoLista = (() => {
    if (carregando) {
      return (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', justifyContent: 'center', py: 4, flex: 1 }}
        >
          <CircularProgress size={28} />
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            Carregando transferências…
          </Typography>
        </Stack>
      );
    }
    if (lista.length === 0) {
      return (
        <Box sx={{ p: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="info" sx={{ width: '100%' }}>
            Nenhuma transferência nesta unidade ({nomeUnidadeAtiva}).
          </Alert>
        </Box>
      );
    }
    return isMobile ? listaMobile : tabelaDesktop;
  })();

  return (
    <ShellComSidebar
      titulo="Transferências"
      subtitulo={`Movimentos da unidade ${nomeUnidadeAtiva}: saídas enviadas e entradas a receber`}
      preencherAltura
    >
      <Stack
        spacing={1.5}
        sx={{
          flex: { xs: 1, sm: 'none' },
          minHeight: { xs: 0, sm: 'auto' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <BoxExportacao
            cores={cores}
            isMobile={isMobile}
            exportando={exportando}
            listaVazia={lista.length === 0}
            carregando={carregando}
            erroExportacao={erroExportacao}
            onLimparErro={() => setErroExportacao(null)}
            onExportar={(f) => void exportar(f)}
          />
          {permissoesAtivas?.podeTransferirEnviar ? (
            <Button
              variant="contained"
              component={Link}
              to="/estoque/transferencias/nova"
              fullWidth={isMobile}
              sx={{
                ...estilos.botaoPrimario,
                minHeight: { xs: 44, sm: 40 },
                flexShrink: 0,
              }}
            >
              Nova transferência
            </Button>
          ) : null}
        </Stack>

        {erro ? (
          <Box sx={{ flexShrink: 0 }}>
            <PainelErro mensagem={erro} />
          </Box>
        ) : null}

        <Card
          sx={{
            borderRadius: 3,
            bgcolor: cores.bgCard,
            border: `1px solid ${cores.border}`,
            flex: { xs: 1, sm: 'none' },
            minHeight: { xs: 0, sm: 'auto' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: { xs: 1, sm: 'none' },
              minHeight: { xs: 0, sm: 'auto' },
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {conteudoLista}
          </Box>
          {barraPaginacao ? <Box sx={{ flexShrink: 0 }}>{barraPaginacao}</Box> : null}
        </Card>
      </Stack>

      <TransferenciaDetalheDrawer
        transferencia={detalheSelecionado}
        aoFechar={() => setDetalheSelecionado(null)}
        podeReceber={permissoesAtivas?.podeTransferirReceber}
        recebendo={salvando}
        onConfirmarRecebimento={(id) => void confirmarRecebimento(id)}
      />
    </ShellComSidebar>
  );
}

type BoxExportacaoProps = {
  cores: ReturnType<typeof useTemaApp>['cores'];
  isMobile: boolean;
  exportando: boolean;
  listaVazia: boolean;
  carregando: boolean;
  erroExportacao: string | null;
  onLimparErro: () => void;
  onExportar: (formato: 'xlsx' | 'csv') => void;
};

function BoxExportacao({
  cores,
  isMobile,
  exportando,
  listaVazia,
  carregando,
  erroExportacao,
  onLimparErro,
  onExportar,
}: BoxExportacaoProps) {
  const desabilitado = listaVazia || exportando || carregando;

  return (
    <Stack spacing={1} sx={{ width: isMobile ? '100%' : 'auto' }}>
      <Stack direction={isMobile ? 'column' : 'row'} sx={{ flexWrap: 'wrap', gap: 1, width: '100%' }}>
        <Tooltip title="Exporta entradas e saídas (Secretaria↔Canil) em planilha .xlsx, com abas por direção quando houver dados.">
          <span style={{ width: isMobile ? '100%' : undefined }}>
            <Button
              size="small"
              fullWidth={isMobile}
              variant="contained"
              startIcon={exportando ? <CircularProgress size={16} color="inherit" /> : <TableViewOutlinedIcon />}
              disabled={desabilitado}
              onClick={() => onExportar('xlsx')}
              sx={{ minHeight: { xs: 44, sm: 'auto' }, textTransform: 'none', fontWeight: 700 }}
            >
              Exportar Excel (.xlsx)
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="CSV com entradas e saídas de transferência entre unidades (integrações externas).">
          <span style={{ width: isMobile ? '100%' : undefined }}>
            <Button
              size="small"
              fullWidth={isMobile}
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              disabled={desabilitado}
              onClick={() => onExportar('csv')}
              sx={{
                minHeight: { xs: 44, sm: 'auto' },
                textTransform: 'none',
                fontWeight: 700,
                borderColor: cores.borderForte,
                color: cores.textPrimary,
              }}
            >
              Exportar CSV
            </Button>
          </span>
        </Tooltip>
      </Stack>
      {erroExportacao ? (
        <Alert severity="warning" onClose={onLimparErro} sx={{ py: 0 }}>
          {erroExportacao}
        </Alert>
      ) : null}
    </Stack>
  );
}
