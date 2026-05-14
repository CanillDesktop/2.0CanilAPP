import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';
import type { CampoOrdenacaoEstoque } from '../hooks/useListaEstoqueProcessada';
import { corChipStatus, rotuloStatusEstoque } from '../utils/estoqueStatusUi';

const sxCelula = {
  color: '#e2e8f0',
  borderColor: 'rgba(148, 163, 184, 0.12)',
};

type Props = {
  isMobile: boolean;
  carregando: boolean;
  dadosPaginados: LinhaOperacionalEstoque[];
  totalFiltrado: number;
  page: number;
  totalPages: number;
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
  const ativo = orderBy === field;
  return (
    <TableCell
      onClick={() => onSort(field)}
      sx={{
        ...sxCelula,
        fontWeight: 700,
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.35)' },
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <span>{label}</span>
        {ativo ? (
          orderDirection === 'asc' ? (
            <ArrowUpwardIcon sx={{ fontSize: 18, color: '#93c5fd' }} />
          ) : (
            <ArrowDownwardIcon sx={{ fontSize: 18, color: '#93c5fd' }} />
          )
        ) : (
          <UnfoldMoreIcon sx={{ fontSize: 18, color: 'rgba(148,163,184,0.5)' }} />
        )}
      </Stack>
    </TableCell>
  );
}

export function EstoqueGestaoConteudo({
  isMobile,
  carregando,
  dadosPaginados,
  totalFiltrado,
  page,
  totalPages,
  onPageChange,
  orderBy,
  orderDirection,
  onSort,
  onRowClick,
}: Props) {
  if (carregando) {
    return (
      <Stack spacing={1.2}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} sx={{ height: 56, borderRadius: 2, bgcolor: 'rgba(148,163,184,0.12)' }} />
        ))}
      </Stack>
    );
  }

  if (totalFiltrado === 0) {
    return (
      <Card sx={{ borderRadius: 3, bgcolor: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#e2e8f0' }}>
            Nenhum item encontrado
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)' }}>
            Ajuste os filtros ou a aba para ver outros registros.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Stack spacing={2}>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          {totalFiltrado} {totalFiltrado === 1 ? 'item' : 'itens'}
        </Typography>
        <Stack spacing={2}>
          {dadosPaginados.map((item) => (
            <Card
              key={`${item.origem}-${item.id}`}
              onClick={() => onRowClick(item)}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#0f172a',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.28)',
                },
              }}
            >
              <Stack spacing={1.25}>
                <Typography sx={{ fontWeight: 700, color: '#f8fafc' }}>{item.nome}</Typography>
                <Stack direction="row" sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                    Qtd: <strong style={{ color: '#e2e8f0' }}>{item.quantidade}</strong>
                  </Typography>
                  <Chip label={rotuloStatusEstoque(item.status)} color={corChipStatus(item.status)} size="small" />
                </Stack>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Validade: {item.validade}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Última mov.: {item.ultimaMovimentacao}
                </Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            sx={{ borderColor: 'rgba(148,163,184,0.35)', color: '#e2e8f0' }}
          >
            Anterior
          </Button>
          <Typography sx={{ color: '#e2e8f0' }}>
            Página {page} / {totalPages}
          </Typography>
          <Button
            variant="outlined"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            sx={{ borderColor: 'rgba(148,163,184,0.35)', color: '#e2e8f0' }}
          >
            Próxima
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
        {totalFiltrado} {totalFiltrado === 1 ? 'item' : 'itens'} (filtrados)
      </Typography>
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: '#0f172a',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          overflow: 'hidden',
        }}
      >
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(15, 23, 42, 0.95)' }}>
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
                    '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.65)' },
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
      </Card>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => onPageChange(value)}
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': { color: '#e2e8f0' },
            '& .Mui-selected': { bgcolor: 'rgba(37,99,235,0.35) !important' },
          }}
        />
      </Box>
    </Stack>
  );
}
