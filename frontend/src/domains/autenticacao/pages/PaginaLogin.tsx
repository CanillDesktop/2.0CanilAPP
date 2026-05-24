import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Navigate, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { FormularioLogin } from '../components/FormularioLogin';

const MotionBox = motion(Box);

export function PaginaLogin() {
  const { autenticado, recarregarSessao } = useAutenticacao();
  const local = useLocation();
  const destino = (local.state as { de?: string } | null)?.de ?? '/';

  if (autenticado) return <Navigate to={destino} replace />;

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
        background:
          'radial-gradient(circle at top left, rgba(37, 99, 235, 0.22), transparent 34%), linear-gradient(135deg, #020617 0%, #040b1f 48%, #0f172a 100%)',
      }}
    >
      <MotionBox
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        sx={{
          width: '100%',
          maxWidth: 1120,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr minmax(440px, 520px)' },
          gap: { xs: 3, md: 5 },
          alignItems: 'center',
        }}
      >
        <Stack sx={{ gap: 3, color: '#e2e8f0', display: { xs: 'none', md: 'flex' } }}>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: '#7dd3fc', fontWeight: 800, letterSpacing: 1.6 }}
            >
              CanilApp Web
            </Typography>
            <Typography
              variant="h3"
              sx={{ maxWidth: 560, mt: 1, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.2 }}
            >
              Gestao de estoque com controle profissional e seguro.
            </Typography>
            <Typography
              variant="body1"
              sx={{ maxWidth: 560, mt: 2, color: 'rgba(203, 213, 225, 0.86)' }}
            >
              Acesse produtos, medicamentos, insumos e o dashboard usando o mesmo ambiente visual padronizado.
            </Typography>
          </Box>

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.2 }}>
            <Chip icon={<Inventory2OutlinedIcon />} label="Produtos" sx={chipSx} />
            <Chip icon={<MedicalServicesOutlinedIcon />} label="Medicamentos" sx={chipSx} />
            <Chip icon={<ScienceOutlinedIcon />} label="Insumos" sx={chipSx} />
          </Stack>
        </Stack>

        <FormularioLogin aoAutenticar={recarregarSessao} />
      </MotionBox>
    </Box>
  );
}

const chipSx = {
  borderRadius: 2,
  border: '1px solid rgba(148, 163, 184, 0.24)',
  backgroundColor: 'rgba(15, 23, 42, 0.82)',
  color: '#e2e8f0',
  '& .MuiChip-icon': { color: '#7dd3fc' },
};
