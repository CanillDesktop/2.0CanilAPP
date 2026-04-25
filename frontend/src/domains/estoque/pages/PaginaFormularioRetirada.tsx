import { FormularioRetirada } from '../components/FormularioRetirada';
import { Box } from '@mui/material';

export function PaginaFormularioRetirada() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        p: 3,
        bgcolor: '#020617',
      }}
    >
      <FormularioRetirada />
    </Box>
  );
}
