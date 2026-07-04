import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { Box, Button, IconButton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';
import { MSG_ERRO } from '../constants/mensagensErroUsuario';
import { SidebarEstoque } from '../../domains/estoque/components/SidebarEstoque';
import { mapearPapelUsuario } from '../types/papelUsuario';
import { BotaoAlternarTema } from './BotaoAlternarTema';
import { SeletorUnidadeEstoque } from './SeletorUnidadeEstoque';

export function AppShellAutenticado() {
  const navigate = useNavigate();
  const { usuario, sair } = useAutenticacao();
  const { cores } = useTemaApp();
  const [menuAberto, setMenuAberto] = useState(false);
  const papelUsuario = mapearPapelUsuario(usuario?.permissao);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: cores.bgShell }}>
      <SidebarEstoque
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        papelUsuario={papelUsuario}
      />

      <Stack
        component="header"
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: { xs: 1.5, sm: 2, md: 3 },
          py: 1.25,
          borderBottom: `1px solid ${cores.border}`,
          bgcolor: alpha(cores.bgShell, 0.96),
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <IconButton
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu de navegação"
          sx={{ color: cores.textPrimary }}
        >
          <MenuOutlinedIcon />
        </IconButton>

        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <SeletorUnidadeEstoque compacto />
          <BotaoAlternarTema variante="icone" />
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ borderColor: cores.borderForte, color: cores.textPrimary, textTransform: 'none' }}
            onClick={() => {
              void (async () => {
                const resultado = await sair();
                navigate('/login', {
                  state: resultado.confirmadoNoServidor ? undefined : { avisoLogout: MSG_ERRO.logoutParcial },
                });
              })();
            }}
          >
            Sair
          </Button>
        </Stack>
      </Stack>

      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
