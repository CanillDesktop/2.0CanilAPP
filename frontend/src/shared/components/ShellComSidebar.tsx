import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { Box, Button, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';
import { SidebarEstoque } from '../../domains/estoque/components/SidebarEstoque';
import { BotaoAlternarTema } from './BotaoAlternarTema';
import { mapearPapelUsuario } from '../types/papelUsuario';

type Props = {
  children: ReactNode;
  titulo: string;
  subtitulo?: string;
};

export function ShellComSidebar({ children, titulo, subtitulo }: Props) {
  const navigate = useNavigate();
  const { usuario, sair } = useAutenticacao();
  const { cores } = useTemaApp();
  const [drawerAbertoMobile, setDrawerAbertoMobile] = useState(false);
  const theme = useTheme();
  const ehMobileMenu = useMediaQuery(theme.breakpoints.down('md'));
  const papelUsuario = mapearPapelUsuario(usuario?.permissao);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: cores.bgShell }}>
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
          bgcolor: cores.bgConteudo,
          borderLeft: { md: `1px solid ${cores.sidebarBorder}` },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
          {ehMobileMenu ? (
            <IconButton color="inherit" onClick={() => setDrawerAbertoMobile(true)} sx={{ color: cores.textPrimary }}>
              <MenuOutlinedIcon />
            </IconButton>
          ) : (
            <Box />
          )}
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <BotaoAlternarTema variante="icone" />
            <Button
              variant="outlined"
              color="inherit"
              sx={{ borderColor: cores.borderForte, color: cores.textPrimary }}
              onClick={() => {
                sair();
                navigate('/login');
              }}
            >
              Sair
            </Button>
          </Stack>
        </Stack>

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
    </Box>
  );
}
