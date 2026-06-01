import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';
import { larguraConteudoPagina, paddingPaginaShell } from '../theme/estilosLayoutPagina';

type Props = {
  children: ReactNode;
  titulo: string;
  subtitulo?: string;
};

/** Cabeçalho de página dentro do shell global (menu hambúrguer fica no topo do app). */
export function ShellComSidebar({ children, titulo, subtitulo }: Props) {
  const { cores } = useTemaApp();

  return (
    <Box sx={{ ...paddingPaginaShell, ...larguraConteudoPagina, bgcolor: cores.bgConteudo, minHeight: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
          {titulo}
        </Typography>
        {subtitulo ? (
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            {subtitulo}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Box>
  );
}
