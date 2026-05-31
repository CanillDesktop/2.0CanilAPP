import { createTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MARCA, obterCoresApp, type ModoTema } from './tokensTema';

export function criarTemaMui(modo: ModoTema) {
  const cores = obterCoresApp(modo);

  return createTheme({
    palette: {
      mode: modo,
      primary: {
        main: cores.accent,
        dark: cores.accentHover,
        contrastText: cores.textOnAccent,
      },
      secondary: {
        main: cores.brandHighlight,
        contrastText: cores.textOnAccent,
      },
      error: {
        main: MARCA.salmao,
      },
      success: {
        main: MARCA.teal,
      },
      warning: {
        main: MARCA.salmao,
      },
      background: {
        default: cores.bgShell,
        paper: cores.bgCard,
      },
      text: {
        primary: cores.textPrimary,
        secondary: cores.textSecondary,
      },
      divider: cores.border,
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
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 10,
            boxShadow: 'none',
            '&:hover': { boxShadow: `0 6px 16px ${alpha(cores.accent, 0.28)}` },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${cores.sidebarBorder}`,
            backgroundColor: cores.bgCard,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&.Mui-selected': {
              backgroundColor: cores.hoverSurfaceStrong,
              borderLeft: `3px solid ${modo === 'light' ? MARCA.roxo : MARCA.teal}`,
              '&:hover': { backgroundColor: cores.hoverSurfaceStrong },
            },
          },
        },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            '&.Mui-completed': { color: cores.accent },
            '&.Mui-active': { color: cores.accent },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          bar: {
            backgroundColor: cores.accent,
          },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: alpha(cores.accent, 0.18),
              color: cores.accent,
              fontWeight: 700,
            },
          },
        },
      },
    },
  });
}
