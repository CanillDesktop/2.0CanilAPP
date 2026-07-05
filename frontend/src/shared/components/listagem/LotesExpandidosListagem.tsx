import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ItemEstoqueDto } from '../../types/itemEstoque';
import { useEstilosListagem } from '../../theme/useEstilosListagem';
import { useOrdenacaoLotes } from '../../hooks/useOrdenacaoLotes';
import { ordenarItensEstoque } from '../../utils/ordenacaoLotes';
import { CabecalhoLotesOrdenavel } from '../detalheItem/CabecalhoLotesOrdenavel';

type Props = {
  lotes: ItemEstoqueDto[];
  nivelMinimo?: number;
  mensagemVazio: string;
  renderLote: (lote: ItemEstoqueDto, index: number) => ReactNode;
};

export function LotesExpandidosListagem({ lotes, nivelMinimo = 0, mensagemVazio, renderLote }: Props) {
  const { cores } = useEstilosListagem();
  const { orderBy, orderDirection, handleSort } = useOrdenacaoLotes();

  const lotesOrdenados = useMemo(
    () => ordenarItensEstoque(lotes, orderBy, orderDirection, nivelMinimo),
    [lotes, orderBy, orderDirection, nivelMinimo],
  );

  if (!lotes.length) {
    return (
      <Typography variant="body2" sx={{ color: cores.textMuted }}>
        {mensagemVazio}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CabecalhoLotesOrdenavel
        orderBy={orderBy}
        orderDirection={orderDirection}
        onSort={handleSort}
        tamanhoGrid="md"
      />
      {lotesOrdenados.map((lote, index) => renderLote(lote, index))}
    </Box>
  );
}
