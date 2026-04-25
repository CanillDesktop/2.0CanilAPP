import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

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
  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: '#0f172a',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        height: '100%',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Stack spacing={0.75}>
            <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)' }}>
              {titulo}
            </Typography>
            {carregando ? (
              <Skeleton width={72} height={32} sx={{ bgcolor: 'rgba(148,163,184,0.15)' }} />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                {valor}
              </Typography>
            )}
          </Stack>
          <Stack
            sx={{
              p: 1,
              borderRadius: 2,
              color: '#7dd3fc',
              bgcolor: 'rgba(56, 189, 248, 0.12)',
            }}
          >
            {icone}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

type ProductKpiCardsProps = {
  totalEstoque: number;
  lotesAtivos: number;
  proximoVencimentoTexto: string;
  carregando?: boolean;
};

export function ProductKpiCards({
  totalEstoque,
  lotesAtivos,
  proximoVencimentoTexto,
  carregando = false,
}: ProductKpiCardsProps) {
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
