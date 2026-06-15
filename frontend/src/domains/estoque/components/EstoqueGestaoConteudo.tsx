import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import type { CampoOrdenacaoEstoque, LinhaOperacionalEstoque } from '../types/tiposEstoque';
import { corChipStatus, rotuloStatusEstoque } from '../utils/estoqueStatusUi';

type Props = {
  isMobile: boolean;
  carregando: boolean;
  dadosPaginados: LinhaOperacionalEstoque[];
  totalFiltrado: number;
  page: number;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  onPageChange: (page: number) => void;
  orderBy: CampoOrdenacaoEstoque;
  orderDirection: 'asc' | 'desc';
  onSort: (field: CampoOrdenacaoEstoque) => void;
  onRowClick: (item: LinhaOperacionalEstoque) => void;
};

function CabecalhoOrdenavel({
  label,
  field,
  orderBy,
  orderDirection,
  onSort,
}: {
  label: string;
  field: CampoOrdenacaoEstoque;
  orderBy: CampoOrdenacaoEstoque;
  orderDirection: 'asc' | 'desc';
  onSort: (field: CampoOrdenacaoEstoque) => void;
}) {
  const { cores, celulaCabecalho } = useEstilosListagem();
  const ativo = orderBy === field;
  return (
    <TableCell
      onClick={() => onSort(field)}
      sx={{
        ...celulaCabecalho,
        borderColor: cores.borderSuave,
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        '&:hover': { bgcolor: cores.hoverSurface },
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <span>{label}</span>
        {ativo ? (
          orderDirection === 'asc' ? (
            <ArrowUpwardIcon sx={{ fontSize: 18, color: cores.focus }} />
          ) : (
            <ArrowDownwardIcon sx={{ fontSize: 18, color: cores.focus }} />
          )
        ) : (
          <UnfoldMoreIcon sx={{ fontSize: 18, color: cores.textMuted, opacity: 0.6 }} />
        )}
      </Stack>
    </TableCell>
  );
}

function BarraPaginacao({
  totalFiltrado,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  totalFiltrado: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}) {
  const { paginacao } = useEstilosListagem();
  return (
    <TablePagination
      component="div"
      sx={paginacao}
      rowsPerPageOptions={[5, 10, 25, 50]}
      count={totalFiltrado}
      rowsPerPage={rowsPerPage}
      page={page - 1}
      onPageChange={(_, newPage) => onPageChange(newPage + 1)}
      onRowsPerPageChange={(e) => onRowsPerPageChange(Number.parseInt(e.target.value, 10))}
      labelRowsPerPage="Itens por página"
      labelDisplayedRows={({ from, to, count }) => (count === 0 ? '0–0 de 0' : `${from}–${to} de ${count}`)}
    />
  );
}

export function EstoqueGestaoConteudo({
  isMobile,
  carregando,
  dadosPaginados,
  totalFiltrado,
  page,
  rowsPerPage,
  onRowsPerPageChange,
  onPageChange,
  orderBy,
  orderDirection,
  onSort,
  onRowClick,
}: Props) {
  const estilos = useEstilosListagem();
  const { cores, celulaTexto, cardTabela, cardMobile, cabecalhoTabela, titulo, legenda } = estilos;

  if (carregando) {
    return (
      <Stack spacing={1.2}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} sx={{ height: 56, borderRadius: 2, bgcolor: cores.hoverSurface }} />
        ))}
      </Stack>
    );
  }

  if (totalFiltrado === 0) {
    return (
      <Card sx={cardTabela}>
        <CardContent>
          <Typography variant="h6" sx={titulo}>
            Nenhum item encontrado
          </Typography>
          <Typography variant="body2" sx={legenda}>
            Ajuste os filtros ou a aba para ver outros registros.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const sxCelula = {
    ...celulaTexto,
    borderColor: cores.borderSuave,
  };

  if (isMobile) {
    return (
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ color: cores.textMuted }}>
          {totalFiltrado} {totalFiltrado === 1 ? 'item' : 'itens'}
        </Typography>
        <Stack spacing={2}>
          {dadosPaginados.map((item) => (
            <Card key={`${item.origem}-${item.id}`} onClick={() => onRowClick(item)} sx={{ ...cardMobile, p: 2, cursor: 'pointer' }}>
              <Stack spacing={1.25}>
                <Typography sx={{ fontWeight: 700, color: cores.textPrimary }}>{item.nome}</Typography>
                <Stack direction="row" sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                    Qtd: <strong style={{ color: cores.textPrimary }}>{item.quantidade}</strong>
                  </Typography>
                  <Chip label={rotuloStatusEstoque(item.status)} color={corChipStatus(item.status)} size="small" />
                </Stack>
                <Typography variant="body2" sx={{ color: cores.textMuted }}>
                  Validade: {item.validade}
                </Typography>
                <Typography variant="body2" sx={{ color: cores.textMuted }}>
                  Última mov.: {item.ultimaMovimentacao}
                </Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
        <BarraPaginacao
          totalFiltrado={totalFiltrado}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ color: cores.textMuted }}>
        {totalFiltrado} {totalFiltrado === 1 ? 'item' : 'itens'} (filtrados)
      </Typography>
      <Card sx={{ ...cardTabela, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={cabecalhoTabela}>
                <CabecalhoOrdenavel
                  label="Nome"
                  field="nome"
                  orderBy={orderBy}
                  orderDirection={orderDirection}
                  onSort={onSort}
                />
                <CabecalhoOrdenavel
                  label="Quantidade"
                  field="quantidade"
                  orderBy={orderBy}
                  orderDirection={orderDirection}
                  onSort={onSort}
                />
                <CabecalhoOrdenavel
                  label="Validade"
                  field="validade"
                  orderBy={orderBy}
                  orderDirection={orderDirection}
                  onSort={onSort}
                />
                <CabecalhoOrdenavel
                  label="Status"
                  field="status"
                  orderBy={orderBy}
                  orderDirection={orderDirection}
                  onSort={onSort}
                />
                <CabecalhoOrdenavel
                  label="Última movimentação"
                  field="ultimaMovimentacao"
                  orderBy={orderBy}
                  orderDirection={orderDirection}
                  onSort={onSort}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {dadosPaginados.map((linha) => (
                <TableRow
                  key={`${linha.origem}-${linha.id}`}
                  hover
                  onClick={() => onRowClick(linha)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: cores.hoverSurfaceStrong },
                  }}
                >
                  <TableCell sx={sxCelula}>{linha.nome}</TableCell>
                  <TableCell sx={sxCelula}>{linha.quantidade}</TableCell>
                  <TableCell sx={sxCelula}>{linha.validade}</TableCell>
                  <TableCell sx={sxCelula}>
                    <Chip label={rotuloStatusEstoque(linha.status)} color={corChipStatus(linha.status)} size="small" />
                  </TableCell>
                  <TableCell sx={sxCelula}>{linha.ultimaMovimentacao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <BarraPaginacao
          totalFiltrado={totalFiltrado}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Card>
    </Stack>
  );
}
