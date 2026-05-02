import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, Button, Chip, LinearProgress, Pagination, Paper, Stack, Typography } from '@mui/material';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';
import { rotuloTipoItem } from '../utils/rotulosEstoque';

export type AlertaCardVariante = 'abaixo_minimo' | 'proximo_vencimento';

type AlertaCardProps = {
  variante: AlertaCardVariante;
  titulo: string;
  descricao: string;
  /** Itens já paginados (slice da página atual). */
  itens: LinhaOperacionalEstoque[];
  /** Total após filtros (ex.: categoria), para chip e contagem. */
  totalFiltrado: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile: boolean;
  carregando: boolean;
  vazioLabel: string;
  onItemClick: (item: LinhaOperacionalEstoque) => void;
};

function rotuloChipContagem(carregando: boolean, total: number) {
  if (carregando) return '...';
  if (total === 0) return 'Nenhum alerta';
  if (total === 1) return '1 item';
  return `${total} itens`;
}

export function AlertaCard({
  variante,
  titulo,
  descricao,
  itens,
  totalFiltrado,
  page,
  totalPages,
  onPageChange,
  isMobile,
  carregando,
  vazioLabel,
  onItemClick,
}: AlertaCardProps) {
  const ehMinimo = variante === 'abaixo_minimo';
  const chipOutline = ehMinimo
    ? { borderColor: 'rgba(248, 113, 113, 0.55)', color: '#fecaca' }
    : { borderColor: 'rgba(251, 191, 36, 0.55)', color: '#fde68a' };

  const lista = itens;

  return (
    <Paper
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        bgcolor: ehMinimo ? 'rgba(127,29,29,0.12)' : 'rgba(113,63,18,0.12)',
        border: ehMinimo
          ? '1px solid rgba(248, 113, 113, 0.24)'
          : '1px solid rgba(251, 191, 36, 0.24)',
        color: '#e2e8f0',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 24px rgba(0,0,0,0.28)',
          borderColor: ehMinimo ? 'rgba(248, 113, 113, 0.45)' : 'rgba(251, 191, 36, 0.45)',
        },
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.75}>
          <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
              {titulo}
            </Typography>
            <Chip
              size="small"
              color={ehMinimo ? 'error' : 'warning'}
              variant="outlined"
              sx={{ fontWeight: 700, ...chipOutline }}
              label={rotuloChipContagem(carregando, totalFiltrado)}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.9)' }}>
            {descricao}
          </Typography>
        </Stack>
        {carregando ? (
          <Typography variant="body2" sx={{ color: 'rgba(148, 163, 184, 0.95)' }}>
            Carregando...
          </Typography>
        ) : lista.length ? (
          <Stack sx={{ gap: 1.25 }}>
            {lista.map((item) => {
              const pct =
                ehMinimo && item.minimo > 0
                  ? Math.min(100, Math.round((item.quantidade / item.minimo) * 100))
                  : 0;
              const bordaHover = ehMinimo ? 'rgba(248, 113, 113, 0.45)' : 'rgba(251, 191, 36, 0.45)';

              return (
                <Box
                  key={`${item.origem}-${item.id}-${variante}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onItemClick(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onItemClick(item);
                    }
                  }}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '1px solid rgba(71, 85, 105, 0.45)',
                    bgcolor: 'rgba(2, 6, 23, 0.55)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: bordaHover,
                      bgcolor: 'rgba(15, 23, 42, 0.85)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    },
                    '&:focus-visible': {
                      outline: '2px solid #38bdf8',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', lineHeight: 1.35 }}>
                        {item.nome}
                      </Typography>
                      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        <Chip
                          label={rotuloTipoItem(item.origem)}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 600,
                            bgcolor: 'rgba(51, 65, 85, 0.6)',
                            color: '#e2e8f0',
                            border: '1px solid rgba(148, 163, 184, 0.25)',
                          }}
                        />
                        {!ehMinimo ? (
                          <Chip label="Próximo do vencimento" size="small" color="warning" sx={{ height: 24 }} />
                        ) : null}
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
                      <Stack sx={{ alignItems: 'flex-end', minWidth: 120 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)' }}>
                          Atual / mínimo
                        </Typography>
                        <Typography
                          variant="h6"
                          component="p"
                          sx={{
                            fontWeight: 800,
                            color: ehMinimo ? '#fca5a5' : '#fde68a',
                            m: 0,
                            lineHeight: 1.2,
                          }}
                        >
                          {item.quantidade}
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 600, mx: 0.5 }}
                          >
                            /
                          </Typography>
                          <Typography component="span" variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
                            {item.minimo}
                          </Typography>
                        </Typography>
                      </Stack>
                      <ChevronRightRoundedIcon sx={{ color: 'rgba(148, 163, 184, 0.7)', mt: 0.25 }} />
                    </Stack>
                  </Stack>
                  {ehMinimo ? (
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      color="error"
                      sx={{
                        mt: 1.5,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: 'rgba(30, 41, 59, 0.9)',
                        '& .MuiLinearProgress-bar': { borderRadius: 999 },
                      }}
                    />
                  ) : null}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: ehMinimo ? 'rgba(52, 211, 153, 0.95)' : 'rgba(148, 163, 184, 0.95)' }}
          >
            {vazioLabel}
          </Typography>
        )}
        {!carregando && totalFiltrado > 0 ? (
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 600, display: 'block' }}>
              {totalFiltrado} {totalFiltrado === 1 ? 'item' : 'itens'}
            </Typography>
            {totalPages > 1 ? (
              isMobile ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    sx={{
                      borderColor: 'rgba(148,163,184,0.35)',
                      color: '#e2e8f0',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Anterior
                  </Button>
                  <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                    Página {page}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    sx={{
                      borderColor: 'rgba(148,163,184,0.35)',
                      color: '#e2e8f0',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Próxima
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_e, value) => onPageChange(value)}
                    color="standard"
                    size="small"
                    sx={{
                      '& .MuiPaginationItem-root': { color: '#e2e8f0' },
                      '& .Mui-selected': {
                        bgcolor: ehMinimo ? 'rgba(248, 113, 113, 0.35)' : 'rgba(251, 191, 36, 0.35)',
                      },
                    }}
                  />
                </Box>
              )
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
