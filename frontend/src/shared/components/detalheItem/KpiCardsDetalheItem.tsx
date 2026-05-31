import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import { Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useEstilosListagem } from '../../theme/useEstilosListagem';

function MiniKpi({
  titulo,
  valor,
  icone,
  carregando,
}: {
  titulo: string;
  valor: string;
  icone: ReactNode;
  carregando?: boolean;
}) {
  const { cores } = useEstilosListagem();

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: cores.metricCardBg,
        border: `1px solid ${cores.metricCardBorder}`,
        height: '100%',
        boxShadow: cores.sombraCard,
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Stack spacing={0.75}>
            <Typography variant="body2" sx={{ color: cores.textSecondary }}>
              {titulo}
            </Typography>
            {carregando ? (
              <Skeleton width={72} height={32} />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 800, color: cores.textPrimary }}>
                {valor}
              </Typography>
            )}
          </Stack>
          <Stack
            sx={{
              p: 1,
              borderRadius: 2,
              color: cores.chipIcon,
              bgcolor: cores.chipBg,
              border: `1px solid ${cores.chipBorder}`,
            }}
          >
            {icone}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

type Props = {
  totalEstoque: number;
  lotesAtivos: number;
  proximoVencimentoTexto: string;
  carregando?: boolean;
};

export function KpiCardsDetalheItem({
  totalEstoque,
  lotesAtivos,
  proximoVencimentoTexto,
  carregando = false,
}: Props) {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MiniKpi
          titulo="Total em estoque"
          valor={String(totalEstoque)}
          icone={<Inventory2OutlinedIcon />}
          carregando={carregando}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MiniKpi
          titulo="Lotes ativos"
          valor={String(lotesAtivos)}
          icone={<LayersOutlinedIcon />}
          carregando={carregando}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MiniKpi
          titulo="Próximo vencimento"
          valor={proximoVencimentoTexto}
          icone={<EventOutlinedIcon />}
          carregando={carregando}
        />
      </Grid>
    </Grid>
  );
}
