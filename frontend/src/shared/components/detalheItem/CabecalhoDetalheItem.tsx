import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEstilosListagem } from '../../theme/useEstilosListagem';

type Props = {
  rotuloLista: string;
  rotaLista: string;
  titulo: string;
};

export function CabecalhoDetalheItem({ rotuloLista, rotaLista, titulo }: Props) {
  const navegar = useNavigate();
  const { cores } = useEstilosListagem();

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        size="small"
        startIcon={<ArrowBackIcon fontSize="small" />}
        onClick={() => navegar(rotaLista)}
        sx={{
          mb: 1.5,
          textTransform: 'none',
          color: cores.textMuted,
          fontWeight: 600,
          px: 0.5,
          minWidth: 0,
          '&:hover': { bgcolor: cores.hoverSurface, color: cores.textPrimary },
        }}
      >
        {rotuloLista}
      </Button>
      <Typography variant="h5" sx={{ fontWeight: 800, color: cores.textPrimary, lineHeight: 1.25 }}>
        {titulo}
      </Typography>
    </Box>
  );
}
