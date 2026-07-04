import type { ReactNode } from 'react';
import { Box, Grid, Skeleton, Stack, Typography, alpha } from '@mui/material';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';
import type { StatusEstoqueFiltro } from '../types/itemComEstoqueLista';

export type KpiListagemItem = {
  titulo: string;
  valor: number;
  icon: ReactNode;
  statusFiltro: StatusEstoqueFiltro;
  corIcone: string;
};

type KpiSectionListagemProps = {
  kpis: KpiListagemItem[];
  carregando: boolean;
  statusSelecionado: StatusEstoqueFiltro;
  onStatusChange: (status: StatusEstoqueFiltro) => void;
};

export function KpiSectionListagem({
  kpis,
  carregando,
  statusSelecionado,
  onStatusChange,
}: KpiSectionListagemProps) {
  const { cores } = useTemaApp();

  function handleClick(statusFiltro: StatusEstoqueFiltro) {
    if (statusFiltro === 'todos') {
      onStatusChange('todos');
      return;
    }
    onStatusChange(statusSelecionado === statusFiltro ? 'todos' : statusFiltro);
  }

  return (
    <Grid container spacing={{ xs: 1.25, sm: 2 }} sx={{ mb: { xs: 1.5, sm: 3 } }}>
      {kpis.map((kpi) => {
        const selecionado = statusSelecionado === kpi.statusFiltro;
        const rotuloAcao =
          kpi.statusFiltro === 'todos'
            ? 'Mostrar todos os itens'
            : selecionado
              ? `Remover filtro ${kpi.titulo}`
              : `Filtrar por ${kpi.titulo}`;

        return (
          <Grid key={kpi.statusFiltro} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Box
              component="button"
              type="button"
              aria-pressed={selecionado}
              aria-label={rotuloAcao}
              onClick={() => handleClick(kpi.statusFiltro)}
              sx={{
                all: 'unset',
                boxSizing: 'border-box',
                display: 'block',
                width: '100%',
                height: '100%',
                minHeight: { xs: 88, sm: 96 },
                borderRadius: 3,
                p: { xs: 1.25, sm: 2 },
                border: `1.5px solid ${selecionado ? cores.accent : cores.metricCardBorder}`,
                backgroundColor: selecionado ? alpha(cores.accent, 0.12) : cores.metricCardBg,
                color: cores.textPrimary,
                boxShadow: selecionado ? `0 0 0 1px ${alpha(cores.accent, 0.35)}` : cores.sombraCard,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
                transition: 'border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
                '&:hover': {
                  borderColor: cores.accent,
                  backgroundColor: selecionado ? alpha(cores.accent, 0.16) : cores.hoverSurfaceStrong,
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
                '&:focus-visible': {
                  outline: `2px solid ${cores.focus}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: { xs: 0.75, sm: 1 }, height: '100%' }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: selecionado ? cores.accent : cores.textMuted,
                      fontWeight: 600,
                      fontSize: { xs: '0.72rem', sm: '0.875rem' },
                      lineHeight: 1.25,
                    }}
                  >
                    {kpi.titulo}
                  </Typography>
                  {carregando ? (
                    <Skeleton width={64} height={36} sx={{ mt: 0.5 }} />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: { xs: '1.35rem', sm: '1.75rem' },
                        fontWeight: 800,
                        lineHeight: 1.2,
                        mt: 0.5,
                        color: cores.textPrimary,
                      }}
                    >
                      {kpi.valor}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    p: { xs: 0.75, sm: 1 },
                    borderRadius: 2,
                    color: kpi.corIcone,
                    bgcolor: selecionado ? alpha(cores.accent, 0.14) : cores.chipBg,
                    border: `1px solid ${selecionado ? alpha(cores.accent, 0.35) : cores.chipBorder}`,
                    display: 'flex',
                    flexShrink: 0,
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.15rem', sm: '1.35rem' },
                    },
                  }}
                >
                  {kpi.icon}
                </Box>
              </Stack>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
