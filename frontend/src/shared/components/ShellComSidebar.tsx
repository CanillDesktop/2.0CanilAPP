import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';
import { larguraConteudoPagina, paddingPaginaShell } from '../theme/estilosLayoutPagina';

type Props = {
  children: ReactNode;
  titulo: string;
  subtitulo?: string;
  /**
   * No mobile, preenche a altura útil da tela (abaixo do header do app)
   * para o conteúdo inferior (ex.: lista + paginação) ocupar o restante.
   */
  preencherAltura?: boolean;
};

/** Cabeçalho de página dentro do shell global (menu hambúrguer fica no topo do app). */
export function ShellComSidebar({ children, titulo, subtitulo, preencherAltura = false }: Props) {
  const { cores } = useTemaApp();

  return (
    <Box
      sx={{
        ...paddingPaginaShell,
        ...larguraConteudoPagina,
        bgcolor: cores.bgConteudo,
        minHeight: '100%',
        ...(preencherAltura
          ? {
              flex: 1,
              minHeight: { xs: 0, sm: '100%' },
              display: 'flex',
              flexDirection: 'column',
              pb: { xs: 1, sm: 4 },
            }
          : {}),
      }}
    >
      <Box sx={{ mb: { xs: preencherAltura ? 1.25 : 2, sm: 2 }, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
          {titulo}
        </Typography>
        {subtitulo ? (
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            {subtitulo}
          </Typography>
        ) : null}
      </Box>
      {preencherAltura ? (
        <Box
          sx={{
            flex: { xs: 1, sm: 'none' },
            minHeight: { xs: 0, sm: 'auto' },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}
