import type { ReactNode } from 'react';
import { Box, Grid, Skeleton, Stack, Typography } from '@mui/material';

type Kpi = {
  titulo: string;
  valor: number;
  icon: ReactNode;
  cor: string;
};

export function KpiSectionProdutos({ kpis, carregando }: { kpis: Kpi[]; carregando: boolean }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {kpis.map((kpi) => (
        <Grid key={kpi.titulo} size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              borderRadius: 3,
              p: 2,
              border: '1px solid rgba(255,255,255,0.05)',
              backgroundColor: '#0f172a',
              color: '#e2e8f0',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {kpi.titulo}
                </Typography>
                {carregando ? (
                  <Skeleton width={90} height={40} />
                ) : (
                  <Typography sx={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
                    {kpi.valor}
                  </Typography>
                )}
              </Box>
              <Box sx={{ color: kpi.cor }}>{kpi.icon}</Box>
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
