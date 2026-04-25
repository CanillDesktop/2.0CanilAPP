import {
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

export type LinhaOperacionalEstoque = {
  id: number;
  nome: string;
  quantidade: number;
  minimo: number;
  origem: 'produto' | 'medicamento' | 'insumo';
  status: 'ok' | 'baixo' | 'critico';
  ultimaMovimentacao: string;
};

function obterCorStatus(status: LinhaOperacionalEstoque['status']): 'success' | 'warning' | 'error' {
  if (status === 'ok') return 'success';
  if (status === 'baixo') return 'warning';
  return 'error';
}

function labelStatus(status: LinhaOperacionalEstoque['status']) {
  if (status === 'ok') return 'OK';
  if (status === 'baixo') return 'Baixo';
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
  const theme = useTheme();
  const ehMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (carregando) {
    return (
      <Stack spacing={1.2}>
        <Skeleton variant="rounded" height={58} />
        <Skeleton variant="rounded" height={58} />
        <Skeleton variant="rounded" height={58} />
      </Stack>
    );
  }

  if (!linhas.length) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6">Sem dados operacionais no momento</Typography>
          <Typography variant="body2" color="text.secondary">
            Novas movimentacoes aparecerao aqui assim que houver atualizacao de estoque.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (ehMobile) {
    return (
      <Stack sx={{ gap: 1.2 }}>
        {linhas.map((linha) => (
          <Card
            key={linha.id}
            sx={{ borderRadius: 3, cursor: aoClicarItem ? 'pointer' : 'default' }}
            onClick={() => aoClicarItem?.(linha)}
          >
            <CardContent>
              <Stack spacing={0.8}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {linha.nome}
                </Typography>
                <Typography variant="body2">Quantidade: {linha.quantidade}</Typography>
                <Typography variant="body2">Minimo: {linha.minimo}</Typography>
                <Typography variant="body2">Ultima movimentacao: {linha.ultimaMovimentacao}</Typography>
                <Chip
                  label={labelStatus(linha.status)}
                  color={obterCorStatus(linha.status)}
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Quantidade</TableCell>
            <TableCell>Minimo</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ultima movimentacao</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {linhas.map((linha) => (
            <TableRow key={linha.id} hover onClick={() => aoClicarItem?.(linha)} sx={{ cursor: 'pointer' }}>
              <TableCell>{linha.nome}</TableCell>
              <TableCell>{linha.quantidade}</TableCell>
              <TableCell>{linha.minimo}</TableCell>
              <TableCell>
                <Chip label={labelStatus(linha.status)} color={obterCorStatus(linha.status)} size="small" />
              </TableCell>
              <TableCell>{linha.ultimaMovimentacao}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
