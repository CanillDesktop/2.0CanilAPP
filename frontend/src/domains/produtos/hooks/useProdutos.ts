import { useCallback, useRef, useState } from 'react';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { useEstadoAssincrono } from '../../../shared/hooks/useEstadoAssincrono';
import { servicoProdutos } from '../services/servicoProdutos';
import type { ProdutoFiltro, ProdutoLeituraDto, ProdutoPaginacaoDto, ProdutosListaPaginadaDto } from '../types/tiposProdutos';

/**
 * Lista paginada com proteção contra race: respostas antigas são ignoradas.
 * Mantém o último resultado bem-sucedido em erro de rede (evita tabela vazia).
 */
export function useListaProdutosPaginados() {
  const [estado, setEstado] = useState<{
    dados: ProdutosListaPaginadaDto | null;
    carregando: boolean;
    erro: string | null;
  }>({ dados: null, carregando: false, erro: null });
  const seqRef = useRef(0);

  const carregar = useCallback(async (filtro?: ProdutoFiltro, paginacao?: ProdutoPaginacaoDto) => {
    const id = ++seqRef.current;
    setEstado((s) => ({ ...s, carregando: true, erro: null }));
    try {
      const dados = await servicoProdutos.listarPaginado(filtro, paginacao);
      if (id !== seqRef.current) return null;
      setEstado({ dados, carregando: false, erro: null });
      return dados;
    } catch (e) {
      if (id !== seqRef.current) return null;
      const mensagem = extrairMensagemErroApi(e);
      setEstado((s) => ({ ...s, carregando: false, erro: mensagem }));
      return null;
    }
  }, []);

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
