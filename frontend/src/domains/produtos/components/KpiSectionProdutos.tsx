import type { ReactNode } from 'react';
import { Box, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { MARCA } from '../../../shared/theme/tokensTema';

type Kpi = {
  titulo: string;
  valor: number;
  icon: ReactNode;
  cor?: string;
};

const CORES_ICONE = (cores: ReturnType<typeof useTemaApp>['cores']) =>
  [cores.accent, cores.brandHighlight, MARCA.salmao, cores.acaoMovimentar] as const;

export function KpiSectionProdutos({ kpis, carregando }: { kpis: Kpi[]; carregando: boolean }) {
  const { cores } = useTemaApp();
  const coresIcone = CORES_ICONE(cores);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {kpis.map((kpi, indice) => (
        <Grid key={kpi.titulo} size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              borderRadius: 3,
              p: 2,
              border: `1px solid ${cores.metricCardBorder}`,
              backgroundColor: cores.metricCardBg,
              color: cores.textPrimary,
              boxShadow: cores.sombraCard,
              height: '100%',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ color: cores.textMuted, fontWeight: 600 }}>
                  {kpi.titulo}
                </Typography>
                {carregando ? (
                  <Skeleton width={90} height={40} />
                ) : (
                  <Typography sx={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, mt: 0.5 }}>
                    {kpi.valor}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  color: coresIcone[indice % coresIcone.length],
                  bgcolor: cores.chipBg,
                  border: `1px solid ${cores.chipBorder}`,
                  display: 'flex',
                }}
              >
                {kpi.icon}
              </Box>
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
