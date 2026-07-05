import { useCallback, useState } from 'react';
import type { CampoOrdenacaoLote, DirecaoOrdenacao } from '../types/ordenacaoLotes';

export function useOrdenacaoLotes(campoInicial: CampoOrdenacaoLote = 'validade') {
  const [orderBy, setOrderBy] = useState<CampoOrdenacaoLote>(campoInicial);
  const [orderDirection, setOrderDirection] = useState<DirecaoOrdenacao>('asc');

  const handleSort = useCallback((field: CampoOrdenacaoLote) => {
    setOrderBy((atual) => {
      if (atual === field) {
        setOrderDirection((direcao) => (direcao === 'asc' ? 'desc' : 'asc'));
        return atual;
      }
      setOrderDirection('asc');
      return field;
    });
  }, []);

  return { orderBy, orderDirection, handleSort };
}
