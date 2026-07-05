import { useEffect, useState } from 'react';
import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { buscarLotesLookupApi, type LoteEstoqueLookupDto } from '../api/estoqueLookupApi';

const PAGE_SIZE = 20;

export function useLookupLotesEstoque(aberto: boolean, itemId: number) {
  const { unidadeAtivaId } = useUnidadeEstoque();
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(0);
  const [itens, setItens] = useState<LoteEstoqueLookupDto[]>([]);
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
  }, [buscaDebounced, itemId]);

  useEffect(() => {
    if (!aberto || unidadeAtivaId == null || itemId <= 0) return;

    let ativo = true;
    setCarregando(true);

    void buscarLotesLookupApi(itemId, buscaDebounced, page + 1, PAGE_SIZE, 'validade', 'asc', unidadeAtivaId)
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
  }, [aberto, buscaDebounced, itemId, page, unidadeAtivaId]);

  return {
    busca,
    setBusca,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    itens,
    totalCount,
    carregando,
  };
}

/** Consulta rápida para auto-selecionar quando há um único lote disponível. */
export async function obterUnicoLoteDisponivel(
  itemId: number,
  unidadeEstoqueId: number,
): Promise<LoteEstoqueLookupDto | null> {
  const res = await buscarLotesLookupApi(itemId, '', 1, 2, 'validade', 'asc', unidadeEstoqueId);
  if (res.totalCount === 1 && res.items.length === 1) return res.items[0] ?? null;
  return null;
}
