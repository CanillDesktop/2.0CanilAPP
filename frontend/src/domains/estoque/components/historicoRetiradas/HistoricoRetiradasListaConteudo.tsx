import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useEstilosListagem } from '../../../../shared/theme/useEstilosListagem';
import { HistoricoRetiradasCelulaData } from '../../utils/historicoRetiradasDataFormat';
import type { RetiradaHistoricoItemDto } from '../../types/tiposEstoque';
import { HistoricoRetiradasStatusChip } from './HistoricoRetiradasStatusChip';

type Props = {
  itens: RetiradaHistoricoItemDto[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  ordenacaoDataAsc: boolean;
  onToggleOrdenacaoData: () => void;
  selecionadoId: number | null;
  onSelecionar: (item: RetiradaHistoricoItemDto) => void;
  carregando: boolean;
  sxPaper: { bgcolor: string; border: string };
};

function CampoCard({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  const { legenda, celulaTexto } = useEstilosListagem();
  return (
    <Box>
      <Typography variant="caption" sx={{ ...legenda, display: 'block', mb: 0.25 }}>
        {rotulo}
      </Typography>
      <Typography variant="body2" component="div" sx={{ ...celulaTexto, fontWeight: 600 }}>
        {valor}
      </Typography>
    </Box>
  );
}

function CardRetirada({
  item,
  selecionado,
  onSelecionar,
}: {
  item: RetiradaHistoricoItemDto;
  selecionado: boolean;
  onSelecionar: (item: RetiradaHistoricoItemDto) => void;
}) {
  const estilos = useEstilosListagem();
  const { cores, cardMobile } = estilos;
  const observacao = item.observacao?.trim();

  return (
    <Card
      component="article"
      onClick={() => onSelecionar(item)}
      sx={{
        ...cardMobile,
        p: 2,
        cursor: 'pointer',
        borderColor: selecionado ? cores.focus : cores.border,
        bgcolor: selecionado ? cores.hoverSurfaceStrong : cores.bgCard,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: cores.textPrimary, lineHeight: 1.3 }}>
              {item.nomeProduto}
            </Typography>
            <Typography variant="caption" sx={{ color: cores.textMuted }}>
              Cód. {item.codigo} · Ref. #{item.id}
            </Typography>
          </Box>
          <HistoricoRetiradasStatusChip status={item.status} />
        </Stack>

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          <CampoCard
            rotulo="Data e horário"
            valor={<HistoricoRetiradasCelulaData iso={item.dataHoraRetirada} />}
          />
          <CampoCard
            rotulo="Quantidade"
            valor={
              <Typography component="span" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                {item.quantidade}
              </Typography>
            }
          />
        </Stack>

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          <CampoCard rotulo="Quem retirou" valor={item.usuarioRetiranteExibicao} />
          <CampoCard rotulo="Quem recebeu" valor={item.usuarioRecebedorExibicao} />
        </Stack>

        <CampoCard rotulo="Lote" valor={item.lote} />

        {observacao ? (
          <CampoCard rotulo="Observação" valor={observacao} />
        ) : (
          <Typography variant="caption" sx={{ color: cores.textMuted }}>
            Sem observação registrada.
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityOutlinedIcon fontSize="small" />}
            onClick={(e) => {
              e.stopPropagation();
              onSelecionar(item);
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderColor: cores.borderForte,
              color: cores.textPrimary,
            }}
          >
            Ver detalhes
          </Button>
        </Box>
      </Stack>
    </Card>
  );
}

function PaginacaoHistorico({
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  sxPaper,
}: {
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  sxPaper: { bgcolor: string; border: string };
}) {
  const estilos = useEstilosListagem();
  return (
    <>
      <Divider sx={{ mb: -0.01 }} />
      <TablePagination
        component={Paper}
        elevation={0}
        rowsPerPageOptions={[10, 20, 50, 100]}
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={(e) => {
          onRowsPerPageChange(parseInt(e.target.value, 10));
          onPageChange(0);
        }}
        labelRowsPerPage="Linhas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : 'mais de ' + to}`
        }
        sx={{
          ...estilos.paginacao,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          ...sxPaper,
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            gap: 1,
            px: { xs: 1, sm: 2 },
          },
        }}
      />
    </>
  );
}

export function HistoricoRetiradasListaConteudo({
  itens,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  ordenacaoDataAsc,
  onToggleOrdenacaoData,
  selecionadoId,
  onSelecionar,
  carregando,
  sxPaper,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const estilos = useEstilosListagem();
  const { cores, paginacao } = estilos;

  if (isMobile) {
    return (
      <Box sx={{ position: 'relative', width: '100%' }}>
        {carregando && (
          <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }} />
        )}
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 600 }}>
              {totalCount} {totalCount === 1 ? 'retirada' : 'retiradas'}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={onToggleOrdenacaoData}
              startIcon={ordenacaoDataAsc ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              sx={{ textTransform: 'none', fontWeight: 700, borderColor: cores.borderForte, color: cores.textPrimary }}
            >
              Data {ordenacaoDataAsc ? '↑' : '↓'}
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            {itens.map((item) => (
              <CardRetirada
                key={item.id}
                item={item}
                selecionado={selecionadoId === item.id}
                onSelecionar={onSelecionar}
              />
            ))}
          </Stack>

          <Paper sx={{ borderRadius: 2, overflow: 'hidden', ...sxPaper }}>
            <TablePagination
              component="div"
              sx={{
                ...paginacao,
                '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', gap: 0.5, px: 1, minHeight: 48 },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.8rem',
                },
              }}
              rowsPerPageOptions={[10, 20, 50]}
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => onPageChange(p)}
              onRowsPerPageChange={(e) => {
                onRowsPerPageChange(parseInt(e.target.value, 10));
                onPageChange(0);
              }}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : to + '+'}`
              }
            />
          </Paper>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {carregando && (
        <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }} />
      )}
      <TableContainer component={Paper} sx={{ borderRadius: 2, width: '100%', ...sxPaper }}>
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: cores.bgCabecalhoTabela, color: cores.textMuted } }}>
              <TableCell sx={{ width: 72 }}>ID</TableCell>
              <TableCell sortDirection={ordenacaoDataAsc ? 'asc' : 'desc'} sx={{ minWidth: 160 }}>
                <TableSortLabel
                  active
                  direction={ordenacaoDataAsc ? 'asc' : 'desc'}
                  onClick={onToggleOrdenacaoData}
                  sx={{ '& .MuiTableSortLabel-icon': { ml: -0.5 } }}
                >
                  Data e horário
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 180 }}>Produto</TableCell>
              <TableCell>Lote</TableCell>
              <TableCell align="right">Qtd</TableCell>
              <TableCell>Retirou</TableCell>
              <TableCell>Recebeu</TableCell>
              <TableCell sx={{ maxWidth: 220 }}>Observação</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.map((r) => (
              <TableRow
                key={r.id}
                hover
                tabIndex={0}
                role="button"
                selected={selecionadoId === r.id}
                onClick={() => onSelecionar(r)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelecionar(r);
                  }
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: cores.hoverSurface },
                  '&.Mui-selected': { bgcolor: cores.hoverSurfaceStrong },
                  '& .MuiTableCell-root': { color: cores.textPrimary, borderColor: cores.borderSuave },
                }}
              >
                <TableCell>{r.id}</TableCell>
                <TableCell>
                  <HistoricoRetiradasCelulaData iso={r.dataHoraRetirada} />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 750, color: cores.textPrimary }}>
                    {r.nomeProduto}
                  </Typography>
                  <Typography variant="caption" sx={{ color: cores.textMuted }}>
                    Cód. {r.codigo}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{r.lote}</TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 820, fontSize: '1rem' }} component="span">
                    {r.quantidade}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{r.usuarioRetiranteExibicao}</Typography>
                  {r.idUsuarioRetirante != null && (
                    <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block' }}>
                      ID usuário {r.idUsuarioRetirante}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{r.usuarioRecebedorExibicao}</Typography>
                  {r.idUsuarioRecebedor != null && (
                    <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block' }}>
                      ID usuário {r.idUsuarioRecebedor}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 220 }}>
                  <Tooltip title={r.observacao?.trim() ? r.observacao : '—'} placement="top-start">
                    <Typography variant="body2" noWrap sx={{ opacity: r.observacao?.trim().length ? 1 : 0.45 }}>
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
                        onSelecionar(r);
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

      <PaginacaoHistorico
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sxPaper={sxPaper}
      />
    </Box>
  );
}
