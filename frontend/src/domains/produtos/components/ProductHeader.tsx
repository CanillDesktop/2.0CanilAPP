import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Typography } from '@mui/material';

type ProductHeaderProps = {
  titulo: string;
  onVoltar: () => void;
  onVoltarInicio: () => void;
};

export function ProductHeader({ titulo, onVoltar, onVoltarInicio }: ProductHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <IconButton
          onClick={onVoltar}
          aria-label="Voltar"
          sx={{
            color: '#e2e8f0',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            flexShrink: 0,
            '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.12)' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', lineHeight: 1.25 }}>
          {titulo}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        onClick={onVoltarInicio}
        sx={{
          flexShrink: 0,
          borderColor: 'rgba(148, 163, 184, 0.35)',
          color: '#e2e8f0',
          width: { xs: '100%', sm: 'auto' },
          '&:hover': { borderColor: 'rgba(125, 211, 252, 0.5)', bgcolor: 'rgba(56, 189, 248, 0.08)' },
        }}
      >
        Voltar ao início
      </Button>
    </Box>
  );
}
