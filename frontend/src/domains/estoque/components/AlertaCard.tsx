import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, Button, Chip, LinearProgress, Pagination, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { MARCA } from '../../../shared/theme/tokensTema';
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
  const { cores, modo } = useTemaApp();
  const ehMinimo = variante === 'abaixo_minimo';
  const cardBg = ehMinimo ? cores.alertMinimoBg : cores.alertVencimentoBg;
  const cardBorder = ehMinimo ? cores.alertMinimoBorder : cores.alertVencimentoBorder;
  const bordaHover = ehMinimo ? cores.alertMinimoBorder : cores.alertVencimentoBorder;

  const chipOutline = ehMinimo
    ? { borderColor: cores.alertMinimoBorder, color: modo === 'light' ? MARCA.salmaoEscuro : MARCA.salmao }
    : { borderColor: cores.alertVencimentoBorder, color: modo === 'light' ? cores.brandHighlight : cores.acaoMovimentar };

  const corDestaqueQtd = ehMinimo
    ? modo === 'light'
      ? MARCA.salmaoEscuro
      : MARCA.salmao
    : modo === 'light'
      ? cores.brandHighlight
      : cores.acaoMovimentar;

  const lista = itens;

  return (
    <Paper
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        bgcolor: cardBg,
        border: `1px solid ${cardBorder}`,
        color: cores.textPrimary,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: cores.sombraCard,
          borderColor: bordaHover,
        },
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.75}>
          <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
              {titulo}
            </Typography>
            <Chip
              size="small"
              color={modo === 'light' ? 'primary' : ehMinimo ? 'error' : 'warning'}
              variant="outlined"
              sx={{ fontWeight: 700, ...chipOutline }}
              label={rotuloChipContagem(carregando, totalFiltrado)}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            {descricao}
          </Typography>
        </Stack>
        {carregando ? (
          <Typography variant="body2" sx={{ color: cores.textMuted }}>
            Carregando...
          </Typography>
        ) : lista.length ? (
          <Stack sx={{ gap: 1.25 }}>
            {lista.map((item) => {
              const pct =
                ehMinimo && item.minimo > 0
                  ? Math.min(100, Math.round((item.quantidade / item.minimo) * 100))
                  : 0;

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
                    border: `1px solid ${cores.alertItemBorder}`,
                    bgcolor: cores.alertItemBg,
                    transition:
                      'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: bordaHover,
                      bgcolor: cores.alertItemHoverBg,
                      boxShadow: cores.sombraCard,
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${cores.focus}`,
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
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cores.textPrimary, lineHeight: 1.35 }}>
                        {item.nome}
                      </Typography>
                      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        <Chip
                          label={rotuloTipoItem(item.origem)}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 600,
                            bgcolor: cores.chipBg,
                            color: cores.textPrimary,
                            border: `1px solid ${cores.chipBorder}`,
                          }}
                        />
                        {!ehMinimo ? (
                          <Chip label="Próximo do vencimento" size="small" color="warning" sx={{ height: 24 }} />
                        ) : null}
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
                      <Stack sx={{ alignItems: 'flex-end', minWidth: 120 }}>
                        <Typography variant="caption" sx={{ color: cores.textMuted }}>
                          Atual / mínimo
                        </Typography>
                        <Typography
                          variant="h6"
                          component="p"
                          sx={{
                            fontWeight: 800,
                            color: corDestaqueQtd,
                            m: 0,
                            lineHeight: 1.2,
                          }}
                        >
                          {item.quantidade}
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ color: cores.textMuted, fontWeight: 600, mx: 0.5 }}
                          >
                            /
                          </Typography>
                          <Typography component="span" variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                            {item.minimo}
                          </Typography>
                        </Typography>
                      </Stack>
                      <ChevronRightRoundedIcon sx={{ color: cores.textMuted, mt: 0.25 }} />
                    </Stack>
                  </Stack>
                  {ehMinimo ? (
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      color={modo === 'light' ? 'primary' : 'error'}
                      sx={{
                        mt: 1.5,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: alpha(cores.textMuted, 0.2),
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
            sx={{ color: cores.textMuted }}
          >
            {vazioLabel}
          </Typography>
        )}
        {!carregando && totalFiltrado > 0 ? (
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 600, display: 'block' }}>
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
                      borderColor: cores.borderForte,
                      color: cores.textPrimary,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Anterior
                  </Button>
                  <Typography variant="body2" sx={{ color: cores.textPrimary, fontWeight: 600 }}>
                    Página {page}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    sx={{
                      borderColor: cores.borderForte,
                      color: cores.textPrimary,
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
                      '& .MuiPaginationItem-root': { color: cores.textPrimary },
                      '& .Mui-selected': {
                        bgcolor: ehMinimo ? alpha(MARCA.salmao, 0.22) : alpha(cores.brandHighlight, 0.22),
                        color: cores.textPrimary,
                        fontWeight: 700,
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
