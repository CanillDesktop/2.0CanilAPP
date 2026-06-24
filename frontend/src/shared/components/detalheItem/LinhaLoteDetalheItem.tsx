import { Box, Button, Card, CardContent, Chip, Grid, Stack, Tooltip, Typography } from '@mui/material';
import type { LoteDetalhe } from '../../types/loteDetalhe';
import { useEstilosListagem } from '../../theme/useEstilosListagem';
import { obterStatusValidade } from '../../utils/loteValidade';

type Props = {
  lote: LoteDetalhe;
  isMobile: boolean;
  onRetirar: (lote: LoteDetalhe) => void;
};

export function LinhaLoteDetalheItem({ lote, isMobile, onRetirar }: Props) {
  const estilos = useEstilosListagem();
  const { cores } = estilos;
  const status = obterStatusValidade(lote.validade);
  const validadeFormatada = lote.validade
    ? new Date(lote.validade).toLocaleDateString('pt-BR')
    : 'Sem validade';
  const tooltipValidade = lote.validade ? new Date(lote.validade).toLocaleString('pt-BR') : 'Sem data de validade';

  if (isMobile) {
    return (
      <Card
        sx={{
          borderRadius: 2.5,
          bgcolor: cores.bgLinhaExpandida,
          border: `1px solid ${cores.border}`,
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                Lote {lote.codigo}
              </Typography>
              <Chip label={status.label} color={status.color} size="small" />
            </Stack>
            <Typography variant="body2" sx={{ color: cores.textSecondary }}>
              Quantidade:{' '}
              <Typography component="span" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                {lote.quantidade}
              </Typography>
            </Typography>
            <Tooltip title={tooltipValidade}>
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                Validade:{' '}
                <Typography component="span" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                  {validadeFormatada}
                </Typography>
              </Typography>
            </Tooltip>
            <Button
              variant="contained"
              size="medium"
              fullWidth
              onClick={() => onRetirar(lote)}
              disabled={lote.quantidade <= 0}
              sx={{ ...estilos.botaoPrimario, mt: 0.5 }}
            >
              Retirar
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid
      container
      spacing={2}
      sx={{
        alignItems: 'center',
        py: 1.5,
        px: 2,
        borderRadius: 2,
        border: `1px solid ${cores.border}`,
        bgcolor: cores.bgLinhaExpandida,
      }}
    >
      <Grid size={{ xs: 12, sm: 3 }}>
        <Typography variant="body2" sx={{ color: cores.textMuted, fontWeight: 600 }}>
          Lote
        </Typography>
        <Typography sx={{ fontWeight: 700, color: cores.textPrimary }}>Lote {lote.codigo}</Typography>
      </Grid>
      <Grid size={{ xs: 4, sm: 2 }}>
        <Typography variant="body2" sx={{ color: cores.textMuted, fontWeight: 600 }}>
          Qtd
        </Typography>
        <Typography sx={{ fontWeight: 700, color: cores.textPrimary }}>{lote.quantidade}</Typography>
      </Grid>
      <Grid size={{ xs: 8, sm: 3 }}>
        <Typography variant="body2" sx={{ color: cores.textMuted, fontWeight: 600 }}>
          Validade
        </Typography>
        <Tooltip title={tooltipValidade}>
          <Typography sx={{ fontWeight: 600, color: cores.textPrimary }}>{validadeFormatada}</Typography>
        </Tooltip>
      </Grid>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Typography variant="body2" sx={{ color: cores.textMuted, fontWeight: 600, mb: 0.5 }}>
          Status
        </Typography>
        <Chip label={status.label} color={status.color} size="small" />
      </Grid>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
          <Button variant="contained" size="small" onClick={() => onRetirar(lote)} disabled={lote.quantidade <= 0} sx={estilos.botaoPrimario}>
            Retirar
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
