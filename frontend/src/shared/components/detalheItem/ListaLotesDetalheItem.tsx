import { Box, Button, Card, CardContent, Grid, Stack, TablePagination, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LoteDetalhe } from '../../types/loteDetalhe';
import { useEstilosListagem } from '../../theme/useEstilosListagem';
import { LinhaLoteDetalheItem } from './LinhaLoteDetalheItem';

const LOTES_POR_PAGINA_PADRAO = 5;
const LOTES_POR_PAGINA_OPCOES = [5, 10, 25];

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
  const estilos = useEstilosListagem();
  const { cores, paginacao } = estilos;
  const total = lotes.length;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(LOTES_POR_PAGINA_PADRAO);

  useEffect(() => {
    setPage(0);
  }, [idItem, total]);

  const paginaMaxima = Math.max(0, Math.ceil(total / rowsPerPage) - 1);
  const pageSegura = Math.min(page, paginaMaxima);

  const lotesPagina = useMemo(() => {
    const inicio = pageSegura * rowsPerPage;
    return lotes.slice(inicio, inicio + rowsPerPage);
  }, [lotes, pageSegura, rowsPerPage]);

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
            lotesPagina.map((lote) => (
              <LinhaLoteDetalheItem key={lote.id} lote={lote} isMobile={isMobile} onRetirar={onRetirar} />
            ))
          )}
        </Stack>

        {total > rowsPerPage ? (
          <TablePagination
            component="div"
            sx={{ ...paginacao, mt: 1 }}
            rowsPerPageOptions={LOTES_POR_PAGINA_OPCOES}
            count={total}
            rowsPerPage={rowsPerPage}
            page={pageSegura}
            onPageChange={(_, novaPagina) => setPage(novaPagina)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number.parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Lotes por página"
            labelDisplayedRows={({ from, to, count }) =>
              count === 0 ? '0–0 de 0' : `${from}–${to} de ${count}`
            }
          />
        ) : null}

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
