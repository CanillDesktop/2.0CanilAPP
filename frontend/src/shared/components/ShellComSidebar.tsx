import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { Box, Button, CssBaseline, IconButton, Stack, ThemeProvider, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../app/providers/ContextoAutenticacao';
import { SidebarEstoque } from '../../domains/estoque/components/SidebarEstoque';
import { temaShellEscuro } from '../theme/temaShellEscuro';
import { mapearPapelUsuario } from '../types/papelUsuario';

type Props = {
  children: ReactNode;
  titulo: string;
  subtitulo?: string;
};

export function ShellComSidebar({ children, titulo, subtitulo }: Props) {
  const navigate = useNavigate();
  const { usuario, sair } = useAutenticacao();
  const [drawerAbertoMobile, setDrawerAbertoMobile] = useState(false);
  const theme = useTheme();
  const ehMobileMenu = useMediaQuery(theme.breakpoints.down('md'));
  const papelUsuario = mapearPapelUsuario(usuario?.permissao);

  return (
    <ThemeProvider theme={temaShellEscuro}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#020617' }}>
        <SidebarEstoque
          abertoMobile={drawerAbertoMobile}
          aoFecharMobile={() => setDrawerAbertoMobile(false)}
          ehMobile={ehMobileMenu}
          papelUsuario={papelUsuario}
        />
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            pt: 2,
            pb: 4,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            {ehMobileMenu ? (
              <IconButton color="inherit" onClick={() => setDrawerAbertoMobile(true)} sx={{ color: '#e2e8f0' }}>
                <MenuOutlinedIcon />
              </IconButton>
            ) : (
              <Box />
            )}
            <Button
              variant="outlined"
              color="inherit"
              sx={{ borderColor: 'rgba(148,163,184,0.35)', color: '#e2e8f0' }}
              onClick={() => {
                sair();
                navigate('/login');
              }}
            >
              Sair
            </Button>
          </Stack>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
              {titulo}
            </Typography>
            {subtitulo ? (
              <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)' }}>
                {subtitulo}
              </Typography>
            ) : null}
          </Box>

          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
