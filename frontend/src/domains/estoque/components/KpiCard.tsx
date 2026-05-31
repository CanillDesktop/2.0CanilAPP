import type { ReactNode } from 'react';
import { Card, CardContent, Skeleton, Stack, Typography, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';

const MotionCard = motion(Card);

type KpiCardProps = {
  titulo: string;
  valor: string;
  icone: ReactNode;
  cor: 'success' | 'warning' | 'error' | 'primary';
  carregando?: boolean;
  destaque?: boolean;
};

export function KpiCard({ titulo, valor, icone, cor, carregando = false, destaque = false }: KpiCardProps) {
  const theme = useTheme();
  const { cores } = useTemaApp();
  const corBase = theme.palette[cor].main;

  return (
    <MotionCard
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      sx={{
        borderRadius: 3,
        border: `1px solid ${cores.metricCardBorder}`,
        bgcolor: destaque ? cores.metricCardBg : alpha(corBase, 0.08),
        boxShadow: cores.sombraCard,
      }}
    >
      <CardContent sx={{ py: destaque ? 2.25 : undefined, px: destaque ? 2.25 : undefined }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Stack spacing={destaque ? 1.25 : 1}>
            <Typography
              variant={destaque ? 'subtitle1' : 'body2'}
              sx={{ color: cores.textMuted, fontWeight: destaque ? 600 : 400 }}
            >
              {titulo}
            </Typography>
            {carregando ? (
              <Skeleton variant="rounded" width={destaque ? 160 : 120} height={destaque ? 44 : 34} />
            ) : (
              <Typography variant={destaque ? 'h4' : 'h5'} sx={{ fontWeight: 800, color: cores.textPrimary }}>
                {valor}
              </Typography>
            )}
          </Stack>
          <Stack
            sx={{
              p: 1.2,
              borderRadius: 2,
              color: corBase,
              bgcolor: cores.chipBg,
              border: `1px solid ${cores.chipBorder}`,
            }}
          >
            {icone}
          </Stack>
        </Stack>
      </CardContent>
    </MotionCard>
  );
}
