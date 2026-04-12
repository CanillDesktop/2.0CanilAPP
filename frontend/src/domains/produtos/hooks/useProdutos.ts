import { useCallback } from 'react';
import { useEstadoAssincrono } from '../../../shared/hooks/useEstadoAssincrono';
import { servicoProdutos } from '../services/servicoProdutos';
import type { ProdutoFiltroDto, ProdutoLeituraDto } from '../types/tiposProdutos';

export function useListaProdutos() {
  const { estado, executar } = useEstadoAssincrono<ProdutoLeituraDto[]>();

  const carregar = useCallback(
    (filtro?: ProdutoFiltroDto) => executar(() => servicoProdutos.listar(filtro)),
    [executar],
  );

  return { estado, carregar };
}

export function useProdutoDetalhe(id: number | undefined) {
  const { estado, executar } = useEstadoAssincrono<ProdutoLeituraDto>();

  const carregar = useCallback(() => {
    if (id == null) return Promise.resolve(null);
    return executar(() => servicoProdutos.obterPorId(id));
  }, [executar, id]);

  return { estado, carregar };
}
