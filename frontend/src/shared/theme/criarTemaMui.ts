import { createTheme } from '@mui/material';
import type { ModoTema } from './tokensTema';
import { obterCoresApp } from './tokensTema';

export function criarTemaMui(modo: ModoTema) {
  const cores = obterCoresApp(modo);

  return createTheme({
    palette: {
      mode: modo,
      primary: {
        main: cores.accent,
      },
      background: {
        default: cores.bgShell,
        paper: cores.bgCard,
      },
      text: {
        primary: cores.textPrimary,
        secondary: cores.textSecondary,
      },
      divider: cores.borderForte,
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: cores.bgShell,
            color: cores.textPrimary,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${cores.sidebarBorder}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: modo === 'light' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.22)',
            },
          },
        },
      },
    },
  });
}
