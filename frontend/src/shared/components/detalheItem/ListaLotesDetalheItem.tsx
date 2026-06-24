import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { LoteDetalhe } from '../../types/loteDetalhe';
import { useEstilosListagem } from '../../theme/useEstilosListagem';
import { LinhaLoteDetalheItem } from './LinhaLoteDetalheItem';

type Props = {
  idItem: number;
  codItem: string;
  lotes: LoteDetalhe[];
  isMobile: boolean;
  rotuloEntidade: string;
  mensagemVazio: string;
  onRetirar: (lote: LoteDetalhe) => void;
  onExcluir: () => void;
};

export function ListaLotesDetalheItem({
  idItem,
  codItem,
  lotes,
  isMobile,
  rotuloEntidade,
  mensagemVazio,
  onRetirar,
  onExcluir,
}: Props) {
  const { cores } = useEstilosListagem();
  const estilos = useEstilosListagem();
  const total = lotes.length;

  return (
    <Card
      sx={{
        mt: { xs: 2, md: 3 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        bgcolor: cores.bgCard,
        border: `1px solid ${cores.border}`,
        boxShadow: cores.sombraCard,
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: cores.textPrimary, mb: 2 }}>
          Lotes ({total})
        </Typography>

        {!isMobile && total > 0 ? (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Grid
              container
              spacing={2}
              sx={{
                alignItems: 'center',
                pb: 1.5,
                px: 0.5,
                borderBottom: `1px solid ${cores.border}`,
                mb: 1.5,
              }}
            >
              <Grid size={{ sm: 3 }}>
                <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 700 }}>
                  Lote
                </Typography>
              </Grid>
              <Grid size={{ sm: 2 }}>
                <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 700 }}>
                  Qtd
                </Typography>
              </Grid>
              <Grid size={{ sm: 3 }}>
                <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 700 }}>
                  Validade
                </Typography>
              </Grid>
              <Grid size={{ sm: 2 }}>
                <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 700 }}>
                  Status
                </Typography>
              </Grid>
              <Grid size={{ sm: 2 }} sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 700 }}>
                  Ação
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ) : null}

        <Stack spacing={1.25}>
          {lotes.length === 0 ? (
            <Typography variant="body2" sx={{ color: cores.textSecondary, py: 1 }}>
              {mensagemVazio}
            </Typography>
          ) : (
            lotes.map((lote) => (
              <LinhaLoteDetalheItem key={lote.id} lote={lote} isMobile={isMobile} onRetirar={onRetirar} />
            ))
          )}
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 3, gap: 2, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}
        >
          <Button
            component={Link}
            to={`/estoque/entradas/novo?idItem=${idItem}&codItem=${encodeURIComponent(codItem)}`}
            variant="contained"
            size="large"
            sx={estilos.botaoPrimario}
          >
            Adicionar lote
          </Button>
          <Button variant="outlined" color="error" size="large" onClick={onExcluir} sx={{ fontWeight: 700 }}>
            Excluir {rotuloEntidade}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
