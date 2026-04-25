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

const sxCelula = {
  color: '#e2e8f0',
  borderColor: 'rgba(148, 163, 184, 0.12)',
};

export function DataTableEstoque({
  linhas,
  carregando = false,
  aoClicarItem,
}: {
  linhas: LinhaOperacionalEstoque[];
  carregando?: boolean;
  aoClicarItem?: (linha: LinhaOperacionalEstoque) => void;
}) {
  if (carregando) {
    return (
      <Stack spacing={1.2}>
        <Skeleton variant="rounded" height={58} sx={{ bgcolor: 'rgba(148,163,184,0.12)' }} />
        <Skeleton variant="rounded" height={58} sx={{ bgcolor: 'rgba(148,163,184,0.12)' }} />
        <Skeleton variant="rounded" height={58} sx={{ bgcolor: 'rgba(148,163,184,0.12)' }} />
      </Stack>
    );
  }

  if (!linhas.length) {
    return (
      <Card sx={{ borderRadius: 3, bgcolor: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#e2e8f0' }}>
            Sem dados neste filtro
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)' }}>
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
        bgcolor: '#0f172a',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        overflow: 'hidden',
      }}
    >
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(15, 23, 42, 0.95)' }}>
              <TableCell sx={{ ...sxCelula, fontWeight: 700 }}>Nome</TableCell>
              <TableCell sx={{ ...sxCelula, fontWeight: 700 }}>Quantidade</TableCell>
              <TableCell sx={{ ...sxCelula, fontWeight: 700 }}>Data de validade</TableCell>
              <TableCell sx={{ ...sxCelula, fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ ...sxCelula, fontWeight: 700 }}>Última movimentação</TableCell>
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
                  '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.65)' },
                }}
              >
                <TableCell sx={sxCelula}>{linha.nome}</TableCell>
                <TableCell sx={sxCelula}>{linha.quantidade}</TableCell>
                <TableCell sx={sxCelula}>{linha.validade}</TableCell>
                <TableCell sx={sxCelula}>
                  <Chip label={labelStatus(linha.status)} color={obterCorStatus(linha.status)} size="small" />
                </TableCell>
                <TableCell sx={sxCelula}>{linha.ultimaMovimentacao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export type { LinhaOperacionalEstoque } from '../types/tiposEstoque';
