import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { LoteProduto } from '../types/loteProduto';
import { LoteRow } from './LoteRow';

type LoteListProps = {
  idItem: number;
  codItem: string;
  lotes: LoteProduto[];
  isMobile: boolean;
  onRetirar: (lote: LoteProduto) => void;
  onExcluirProduto: () => void;
};

export function LoteList({ idItem, codItem, lotes, isMobile, onRetirar, onExcluirProduto }: LoteListProps) {
  const total = lotes.length;

  return (
    <Card
      sx={{
        mt: { xs: 2, md: 3 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        bgcolor: '#0f172a',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 2 }}>
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
                borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                mb: 1.5,
              }}
            >
              <Grid size={{ sm: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 700 }}>
                  Lote
                </Typography>
              </Grid>
              <Grid size={{ sm: 2 }}>
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 700 }}>
                  Qtd
                </Typography>
              </Grid>
              <Grid size={{ sm: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 700 }}>
                  Validade
                </Typography>
              </Grid>
              <Grid size={{ sm: 2 }}>
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 700 }}>
                  Status
                </Typography>
              </Grid>
              <Grid size={{ sm: 2 }} sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 700 }}>
                  Ação
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ) : null}

        <Stack spacing={1.25}>
          {lotes.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'rgba(203, 213, 225, 0.85)', py: 1 }}>
              Nenhum lote cadastrado para este produto.
            </Typography>
          ) : (
            lotes.map((lote) => <LoteRow key={lote.id} lote={lote} isMobile={isMobile} onRetirar={onRetirar} />)
          )}
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 3, gap: 2, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}
        >
          <Button
            component={Link}
            to={`/estoque/lotes/novo?idItem=${idItem}&codItem=${encodeURIComponent(codItem)}`}
            variant="contained"
            size="large"
            sx={{ fontWeight: 700 }}
          >
            Adicionar lote
          </Button>
          <Button variant="outlined" color="error" size="large" onClick={onExcluirProduto} sx={{ fontWeight: 700 }}>
            Excluir produto
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
