import type { ReactNode } from 'react';
import { Card, CardContent, Skeleton, Stack, Typography, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

type KpiCardProps = {
  titulo: string;
  valor: string;
  icone: ReactNode;
  cor: 'success' | 'warning' | 'error' | 'primary';
  carregando?: boolean;
};

export function KpiCard({ titulo, valor, icone, cor, carregando = false }: KpiCardProps) {
  const theme = useTheme();
  const corBase = theme.palette[cor].main;

  return (
    <MotionCard
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(corBase, 0.28)}`,
        bgcolor: alpha(corBase, 0.08),
        boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {titulo}
            </Typography>
            {carregando ? (
              <Skeleton variant="rounded" width={120} height={34} />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {valor}
              </Typography>
            )}
          </Stack>
          <Stack
            sx={{
              p: 1.2,
              borderRadius: 2,
              color: corBase,
              bgcolor: alpha(corBase, 0.14),
            }}
          >
            {icone}
          </Stack>
        </Stack>
      </CardContent>
    </MotionCard>
  );
}
