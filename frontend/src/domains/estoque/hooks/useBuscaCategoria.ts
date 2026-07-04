import { useEffect, useState } from 'react';
import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';
import { consultarEstoquePaginadoApi } from '../api/estoqueConsultaApi';
import { ESTOQUE_ORIGEM_API, type LinhaOperacionalEstoque } from '../types/tiposEstoque';
import { mapearEstoqueLinhaDto } from '../utils/mapearLinhaOperacionalEstoque';

export type CategoriaBusca = 'produto' | 'medicamento' | 'insumo';

export type FiltrosAvancadosBusca = {
  qtdMin: string;
  qtdMax: string;
  validadeInicio: string;
  validadeFim: string;
  movInicio: string;
  movFim: string;
  status: '' | 'ok' | 'baixo' | 'critico' | 'vencimento';
};

function paraInteiroOuUndefined(valor: string): number | undefined {
  const t = valor.trim();
  if (t === '') return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

export function useBuscaCategoria(
  categoria: CategoriaBusca,
  pagina: number,
  pageSize: number,
  filtrosAvancados: FiltrosAvancadosBusca,
) {
  const { unidadeAtivaId } = useUnidadeEstoque();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [resultados, setResultados] = useState<LinhaOperacionalEstoque[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (unidadeAtivaId == null) {
        setResultados([]);
        setTotalCount(0);
        setTotalPages(1);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      try {
        const statusOperacional =
          filtrosAvancados.status === 'vencimento'
            ? 'proximo_vencimento'
            : filtrosAvancados.status || undefined;

        const resposta = await consultarEstoquePaginadoApi(
          {
            origem: ESTOQUE_ORIGEM_API[categoria],
            termoBusca: debouncedTerm || undefined,
            statusOperacional,
            quantidadeMinima: paraInteiroOuUndefined(filtrosAvancados.qtdMin),
            quantidadeMaxima: paraInteiroOuUndefined(filtrosAvancados.qtdMax),
            validadeDe: filtrosAvancados.validadeInicio || undefined,
            validadeAte: filtrosAvancados.validadeFim || undefined,
            movimentacaoDe: filtrosAvancados.movInicio || undefined,
            movimentacaoAte: filtrosAvancados.movFim || undefined,
          },
          {
            pageNumber: pagina,
            pageSize,
            orderBy: 'nome',
            sortDirection: 'asc',
          },
          unidadeAtivaId,
        );

        if (!ativo) return;
        setResultados(resposta.items.map(mapearEstoqueLinhaDto));
        setTotalCount(resposta.totalCount);
        setTotalPages(resposta.totalPages > 0 ? resposta.totalPages : 1);
      } catch {
        if (!ativo) return;
        setResultados([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, [unidadeAtivaId, categoria, debouncedTerm, pagina, pageSize, filtrosAvancados]);

  return {
    searchTerm,
    setSearchTerm,
    resultados,
    carregando,
    totalCount,
    totalPages,
    termoNomeDebounced: debouncedTerm.toLowerCase(),
  };
}
