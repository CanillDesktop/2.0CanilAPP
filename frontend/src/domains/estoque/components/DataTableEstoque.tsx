import {
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

function obterCorStatus(status: LinhaOperacionalEstoque['status']): 'success' | 'warning' | 'error' {
  if (status === 'ok') return 'success';
  if (status === 'baixo') return 'warning';
  return 'error';
}

function labelStatus(status: LinhaOperacionalEstoque['status']) {
  if (status === 'ok') return 'OK';
  if (status === 'baixo') return 'Abaixo do nível mínimo';
  if (status === 'proximo_vencimento') return 'Proximo do vencimento';
  return 'Critico';
}

export function DataTableEstoque({
  linhas,
  carregando = false,
  aoClicarItem,
}: {
  linhas: LinhaOperacionalEstoque[];
  carregando?: boolean;
  aoClicarItem?: (linha: LinhaOperacionalEstoque) => void;
}) {
  const { cores } = useTemaApp();

  if (carregando) {
    return (
      <Stack spacing={1.2}>
        <Skeleton variant="rounded" height={58} sx={{ bgcolor: cores.hoverSurface }} />
        <Skeleton variant="rounded" height={58} sx={{ bgcolor: cores.hoverSurface }} />
        <Skeleton variant="rounded" height={58} sx={{ bgcolor: cores.hoverSurface }} />
      </Stack>
    );
  }

  if (!linhas.length) {
    return (
      <Card sx={{ borderRadius: 3, bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, boxShadow: cores.sombraCard }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: cores.textPrimary }}>
            Sem dados neste filtro
          </Typography>
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            Ajuste a aba ou o nome consultado para ver outros itens.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: cores.bgCard,
        border: `1px solid ${cores.border}`,
        boxShadow: cores.sombraCard,
        overflow: 'hidden',
      }}
    >
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: cores.bgCabecalhoTabela }}>
              <TableCell sx={{ color: cores.textMuted, fontWeight: 700, borderColor: cores.borderSuave }}>Nome</TableCell>
              <TableCell sx={{ color: cores.textMuted, fontWeight: 700, borderColor: cores.borderSuave }}>Quantidade</TableCell>
              <TableCell sx={{ color: cores.textMuted, fontWeight: 700, borderColor: cores.borderSuave }}>Data de validade</TableCell>
              <TableCell sx={{ color: cores.textMuted, fontWeight: 700, borderColor: cores.borderSuave }}>Status</TableCell>
              <TableCell sx={{ color: cores.textMuted, fontWeight: 700, borderColor: cores.borderSuave }}>Última movimentação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linhas.map((linha) => (
              <TableRow
                key={`${linha.origem}-${linha.id}`}
                hover
                onClick={() => aoClicarItem?.(linha)}
                sx={{
                  cursor: aoClicarItem ? 'pointer' : 'default',
                  '&:hover': { bgcolor: cores.hoverSurface },
                }}
              >
                <TableCell sx={{ color: cores.textPrimary, borderColor: cores.borderSuave }}>{linha.nome}</TableCell>
                <TableCell sx={{ color: cores.textPrimary, borderColor: cores.borderSuave }}>{linha.quantidade}</TableCell>
                <TableCell sx={{ color: cores.textPrimary, borderColor: cores.borderSuave }}>{linha.validade}</TableCell>
                <TableCell sx={{ color: cores.textPrimary, borderColor: cores.borderSuave }}>
                  <Chip label={labelStatus(linha.status)} color={obterCorStatus(linha.status)} size="small" />
                </TableCell>
                <TableCell sx={{ color: cores.textPrimary, borderColor: cores.borderSuave }}>{linha.ultimaMovimentacao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export type { LinhaOperacionalEstoque } from '../types/tiposEstoque';
