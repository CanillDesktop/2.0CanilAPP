import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import { Card, CardContent, Grid, Skeleton, Stack, Typography, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export type ContagemPorClasse = {
  produtos: number;
  medicamentos: number;
  insumos: number;
};

type Props = {
  carregando?: boolean;
  totalItens: number;
  contagemPorOrigem: ContagemPorClasse;
};

export function ResumoItensCadastrados({ carregando = false, totalItens, contagemPorOrigem }: Props) {
  const theme = useTheme();
  const corBase = theme.palette.primary.main;
  const metricas = [
    { id: 'total', label: 'Total', valor: totalItens, icone: <WarehouseOutlinedIcon /> },
    { id: 'produtos', label: 'Produtos', valor: contagemPorOrigem.produtos, icone: <Inventory2OutlinedIcon /> },
    { id: 'medicamentos', label: 'Medicamentos', valor: contagemPorOrigem.medicamentos, icone: <MedicalServicesOutlinedIcon /> },
    { id: 'insumos', label: 'Insumos', valor: contagemPorOrigem.insumos, icone: <ScienceOutlinedIcon /> },
  ] as const;

  return (
    <Grid container spacing={2}>
      {metricas.map((metrica) => (
        <Grid key={metrica.id} size={{ xs: 12, sm: 6, md: 3 }}>
          <MotionCard
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(corBase, 0.28)}`,
              bgcolor: alpha(corBase, 0.08),
              boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
              height: '100%',
            }}
          >
            <CardContent sx={{ py: 2.25, px: 2.25 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {metrica.label}
                  </Typography>
                  {carregando ? (
                    <Skeleton variant="rounded" width={90} height={36} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#e2e8f0' }}>
                      {metrica.valor}
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
                  {metrica.icone}
                </Stack>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      ))}
    </Grid>
  );
}
