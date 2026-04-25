import { Box, Button, Card, CardContent, Chip, Grid, Stack, Tooltip, Typography } from '@mui/material';
import type { LoteProduto } from '../types/loteProduto';
import { obterStatusValidade } from '../utils/loteValidade';

type LoteRowProps = {
  lote: LoteProduto;
  isMobile: boolean;
  onRetirar: (lote: LoteProduto) => void;
};

export function LoteRow({ lote, isMobile, onRetirar }: LoteRowProps) {
  const status = obterStatusValidade(lote.validade);
  const validade = new Date(lote.validade);
  const validadeFormatada = validade.toLocaleDateString('pt-BR');

  if (isMobile) {
    return (
      <Card
        sx={{
          borderRadius: 2.5,
          bgcolor: 'rgba(2, 6, 23, 0.65)',
          border: '1px solid rgba(71, 85, 105, 0.45)',
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                Lote {lote.codigo}
              </Typography>
              <Chip label={status.label} color={status.color} size="small" />
            </Stack>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
              Quantidade: <strong style={{ color: '#e2e8f0' }}>{lote.quantidade}</strong>
            </Typography>
            <Tooltip title={validade.toLocaleString('pt-BR')}>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                Validade: <strong style={{ color: '#e2e8f0' }}>{validadeFormatada}</strong>
              </Typography>
            </Tooltip>
            <Button
              variant="contained"
              size="medium"
              fullWidth
              onClick={() => onRetirar(lote)}
              disabled={lote.quantidade <= 0}
              sx={{ mt: 0.5 }}
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
        border: '1px solid rgba(71, 85, 105, 0.45)',
        bgcolor: 'rgba(2, 6, 23, 0.55)',
      }}
    >
      <Grid size={{ xs: 12, sm: 3 }}>
        <Typography variant="body2" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 600 }}>
          Lote
        </Typography>
        <Typography sx={{ fontWeight: 700, color: '#f8fafc' }}>Lote {lote.codigo}</Typography>
      </Grid>
      <Grid size={{ xs: 4, sm: 2 }}>
        <Typography variant="body2" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 600 }}>
          Qtd
        </Typography>
        <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>{lote.quantidade}</Typography>
      </Grid>
      <Grid size={{ xs: 8, sm: 3 }}>
        <Typography variant="body2" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 600 }}>
          Validade
        </Typography>
        <Tooltip title={validade.toLocaleString('pt-BR')}>
          <Typography sx={{ fontWeight: 600, color: '#e2e8f0' }}>{validadeFormatada}</Typography>
        </Tooltip>
      </Grid>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Typography variant="body2" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 600, mb: 0.5 }}>
          Status
        </Typography>
        <Chip label={status.label} color={status.color} size="small" />
      </Grid>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
          <Button variant="contained" size="small" onClick={() => onRetirar(lote)} disabled={lote.quantidade <= 0}>
            Retirar
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
