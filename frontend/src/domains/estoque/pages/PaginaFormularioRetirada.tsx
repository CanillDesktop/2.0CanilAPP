import { Box } from '@mui/material';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { larguraConteudoPagina, paddingPaginaFormulario } from '../../../shared/theme/estilosLayoutPagina';
import { FormularioRetirada } from '../components/FormularioRetirada';

export function PaginaFormularioRetirada() {
  const { cores } = useTemaApp();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100%',
        ...paddingPaginaFormulario,
        ...larguraConteudoPagina,
        bgcolor: cores.bgConteudo,
      }}
    >
      <FormularioRetirada />
    </Box>
  );
}
