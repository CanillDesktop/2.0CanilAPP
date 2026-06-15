import { Box } from '@mui/material';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { BotaoAlternarTema } from '../../../shared/components/BotaoAlternarTema';
import { FormularioCadastroUsuario } from '../components/FormularioCadastroUsuario';

export function PaginaCadastroUsuario() {
  const { cores } = useTemaApp();

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

      <FormularioCadastroUsuario />
    </Box>
  );
}
