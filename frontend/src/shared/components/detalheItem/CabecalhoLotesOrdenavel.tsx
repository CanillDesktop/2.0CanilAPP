import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Box, Grid, Stack, Typography } from '@mui/material';
import type { CampoOrdenacaoLote, DirecaoOrdenacao } from '../../types/ordenacaoLotes';
import { useEstilosListagem } from '../../theme/useEstilosListagem';

type Props = {
  orderBy: CampoOrdenacaoLote;
  orderDirection: DirecaoOrdenacao;
  onSort: (field: CampoOrdenacaoLote) => void;
  mostrarAcao?: boolean;
  tamanhoGrid?: 'sm' | 'md';
};

function CelulaOrdenavel({
  label,
  field,
  orderBy,
  orderDirection,
  onSort,
  alinhamento = 'left',
}: {
  label: string;
  field: CampoOrdenacaoLote;
  orderBy: CampoOrdenacaoLote;
  orderDirection: DirecaoOrdenacao;
  onSort: (field: CampoOrdenacaoLote) => void;
  alinhamento?: 'left' | 'right';
}) {
  const { cores } = useEstilosListagem();
  const ativo = orderBy === field;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onSort(field)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSort(field);
        }
      }}
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        textAlign: alinhamento,
        '&:hover': { opacity: 0.85 },
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: alinhamento === 'right' ? 'flex-end' : 'flex-start' }}>
        <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 700 }}>
          {label}
        </Typography>
        {ativo ? (
          orderDirection === 'asc' ? (
            <ArrowUpwardIcon sx={{ fontSize: 16, color: cores.focus }} />
          ) : (
            <ArrowDownwardIcon sx={{ fontSize: 16, color: cores.focus }} />
          )
        ) : (
          <UnfoldMoreIcon sx={{ fontSize: 16, color: cores.textMuted, opacity: 0.6 }} />
        )}
      </Stack>
    </Box>
  );
}

export function CabecalhoLotesOrdenavel({
  orderBy,
  orderDirection,
  onSort,
  mostrarAcao = true,
  tamanhoGrid = 'sm',
}: Props) {
  const { cores } = useEstilosListagem();
  const colunas =
    tamanhoGrid === 'md'
      ? { lote: { md: 3 }, qtd: { md: 2 }, validade: { md: 3 }, status: { md: 2 }, acao: { md: 2 } }
      : { lote: { sm: 3 }, qtd: { sm: 2 }, validade: { sm: 3 }, status: { sm: 2 }, acao: { sm: 2 } };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        alignItems: 'center',
        pb: 1.5,
        px: tamanhoGrid === 'md' ? 2 : 0.5,
        borderBottom: `1px solid ${cores.border}`,
        mb: tamanhoGrid === 'md' ? 0 : 1.5,
        display: tamanhoGrid === 'md' ? { xs: 'none', md: 'flex' } : { xs: 'none', sm: 'flex' },
      }}
    >
      <Grid size={colunas.lote}>
        <CelulaOrdenavel label="Lote" field="lote" orderBy={orderBy} orderDirection={orderDirection} onSort={onSort} />
      </Grid>
      <Grid size={colunas.qtd}>
        <CelulaOrdenavel label="Qtd" field="quantidade" orderBy={orderBy} orderDirection={orderDirection} onSort={onSort} />
      </Grid>
      <Grid size={colunas.validade}>
        <CelulaOrdenavel label="Validade" field="validade" orderBy={orderBy} orderDirection={orderDirection} onSort={onSort} />
      </Grid>
      <Grid size={colunas.status}>
        <CelulaOrdenavel label="Status" field="status" orderBy={orderBy} orderDirection={orderDirection} onSort={onSort} />
      </Grid>
      {mostrarAcao ? (
        <Grid size={colunas.acao} sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 700 }}>
            Ação
          </Typography>
        </Grid>
      ) : null}
    </Grid>
  );
}
