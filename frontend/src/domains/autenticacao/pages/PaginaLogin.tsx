import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { BotaoAlternarTema } from '../../../shared/components/BotaoAlternarTema';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
import { redefinirEstadoEncerramentoSessao } from '../services/gerenciadorRenovacaoSessao';
import { FormularioLogin } from '../components/FormularioLogin';

const MotionBox = motion(Box);

export function PaginaLogin() {
  const { autenticado, recarregarSessao } = useAutenticacao();
  const { cores } = useTemaApp();
  const local = useLocation();
  const params = new URLSearchParams(local.search);
  const destinoQuery = params.get('de');
  const destino = (local.state as { de?: string } | null)?.de ?? destinoQuery ?? '/';
  const avisoLogout = (local.state as { avisoLogout?: string } | null)?.avisoLogout;
  const sessaoExpirada = params.get('motivo') === 'sessao-expirada';

  useEffect(() => {
    redefinirEstadoEncerramentoSessao();
  }, []);

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
        background: cores.gradienteLogin,
      }}
    >
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 2 }}>
        <BotaoAlternarTema variante="botao" />
      </Box>

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
        <Stack sx={{ gap: 3, color: cores.textPrimary, display: { xs: 'none', md: 'flex' } }}>
          <Box>
            <Typography variant="overline" sx={{ color: cores.focus, fontWeight: 800, letterSpacing: 1.6 }}>
              CanilApp Web
            </Typography>
            <Typography
              variant="h3"
              sx={{ maxWidth: 560, mt: 1, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.2, color: cores.textPrimary }}
            >
              Gestão de estoque com controle profissional e seguro.
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 560, mt: 2, color: cores.textSecondary }}>
              Acesse produtos, medicamentos, insumos e o dashboard usando o mesmo ambiente visual padronizado.
            </Typography>
          </Box>

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.2 }}>
            <Chip
              icon={<Inventory2OutlinedIcon />}
              label="Produtos"
              sx={{
                borderRadius: 2,
                border: `1px solid ${cores.chipBorder}`,
                backgroundColor: cores.chipBg,
                color: cores.textPrimary,
                '& .MuiChip-icon': { color: cores.chipIcon },
              }}
            />
            <Chip
              icon={<MedicalServicesOutlinedIcon />}
              label="Medicamentos"
              sx={{
                borderRadius: 2,
                border: `1px solid ${cores.chipBorder}`,
                backgroundColor: cores.chipBg,
                color: cores.textPrimary,
                '& .MuiChip-icon': { color: cores.chipIcon },
              }}
            />
            <Chip
              icon={<ScienceOutlinedIcon />}
              label="Insumos"
              sx={{
                borderRadius: 2,
                border: `1px solid ${cores.chipBorder}`,
                backgroundColor: cores.chipBg,
                color: cores.textPrimary,
                '& .MuiChip-icon': { color: cores.chipIcon },
              }}
            />
          </Stack>
        </Stack>

        <Stack sx={{ gap: 2, width: '100%' }}>
          {sessaoExpirada ? (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {MSG_ERRO.sessaoExpirada}
            </Alert>
          ) : null}
          {avisoLogout ? (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {avisoLogout}
            </Alert>
          ) : null}
          <FormularioLogin aoAutenticar={recarregarSessao} />
        </Stack>
      </MotionBox>
    </Box>
  );
}
