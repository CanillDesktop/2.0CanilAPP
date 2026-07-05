import { useCallback, useEffect, useState } from 'react';
import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { buscarItensLookupApi, type ItemEstoqueLookupDto } from '../api/estoqueLookupApi';
import { ESTOQUE_ORIGEM_POR_NUMERO } from '../types/tiposEstoque';

const PAGE_SIZE = 20;

export function useLookupItensEstoque(aberto: boolean) {
  const { unidadeAtivaId } = useUnidadeEstoque();
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(0);
  const [itens, setItens] = useState<ItemEstoqueLookupDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [carregando, setCarregando] = useState(false);

  const buscaDebounced = useDebouncedValue(busca, 300);

  useEffect(() => {
    if (!aberto) {
      setBusca('');
      setPage(0);
      setItens([]);
      setTotalCount(0);
    }
  }, [aberto]);

  useEffect(() => {
    setPage(0);
  }, [buscaDebounced]);

  useEffect(() => {
    if (!aberto || unidadeAtivaId == null) return;

    const texto = buscaDebounced.trim();
    const permitido = texto.length === 0 ? false : /^\d+$/.test(texto) || texto.length >= 2;
    if (!permitido) {
      setItens([]);
      setTotalCount(0);
      setCarregando(false);
      return;
    }

    let ativo = true;
    setCarregando(true);

    void buscarItensLookupApi(texto, page + 1, PAGE_SIZE, unidadeAtivaId)
      .then((res) => {
        if (!ativo) return;
        setItens(res.items);
        setTotalCount(res.totalCount);
      })
      .catch(() => {
        if (!ativo) return;
        setItens([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [aberto, buscaDebounced, page, unidadeAtivaId]);

  const origemLabel = useCallback((origem: number) => {
    const chave = ESTOQUE_ORIGEM_POR_NUMERO[origem];
    if (chave === 'medicamento') return 'Medicamento';
    if (chave === 'insumo') return 'Insumo';
    return 'Produto';
  }, []);

  return {
    busca,
    setBusca,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    itens,
    totalCount,
    carregando,
    origemLabel,
  };
}
