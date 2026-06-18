import { useCallback, useRef, useState } from 'react';
import { capturarErroMutacao, ErroApi, extrairMensagemErroApi, type ResultadoMutacao } from '../../../infrastructure/http/erroApi';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
import { useEstadoAssincrono } from '../../../shared/hooks/useEstadoAssincrono';
import { servicoInsumos } from '../services/servicoInsumos';
import type {
  InsumoCadastroDto,
  InsumoFiltro,
  InsumoLeituraDto,
  InsumoPaginacaoDto,
  InsumosListaPaginadaDto,
} from '../types/tiposInsumos';

/**
 * Lista paginada com proteção contra race: respostas antigas são ignoradas.
 * Mantém o último resultado bem-sucedido em erro de rede (evita tabela vazia).
 */
export function useListaInsumosPaginados() {
  const [estado, setEstado] = useState<{
    dados: InsumosListaPaginadaDto | null;
    carregando: boolean;
    erro: string | null;
  }>({ dados: null, carregando: false, erro: null });
  const seqRef = useRef(0);

  const carregar = useCallback(async (filtro?: InsumoFiltro, paginacao?: InsumoPaginacaoDto) => {
    const id = ++seqRef.current;
    setEstado((s) => ({ ...s, carregando: true, erro: null }));
    try {
      const dados = await servicoInsumos.listarPaginado(filtro, paginacao);
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

export function useInsumoDetalhe(id: number | undefined) {
  const { estado, executar } = useEstadoAssincrono<InsumoLeituraDto>();
  const carregar = useCallback(() => {
    if (id == null) return Promise.resolve(null);
    return executar(() => servicoInsumos.obterPorId(id));
  }, [executar, id]);
  return { estado, carregar };
}

export function useMutacaoInsumo() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);

  const criar = useCallback(async (dto: InsumoCadastroDto): Promise<ResultadoMutacao> => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoInsumos.criar(dto);
      return { ok: true };
    } catch (e) {
      const falha = capturarErroMutacao(e, MSG_ERRO.operacao);
      if (!falha.ok) setErro(falha.mensagem);
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return falha;
    } finally {
      setCarregando(false);
    }
  }, []);

  const excluir = useCallback(async (id: number): Promise<ResultadoMutacao> => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoInsumos.excluir(id);
      return { ok: true };
    } catch (e) {
      const falha = capturarErroMutacao(e, MSG_ERRO.excluirInsumo);
      if (!falha.ok) setErro(falha.mensagem);
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return falha;
    } finally {
      setCarregando(false);
    }
  }, []);

  return { criar, excluir, carregando, erro, errosValidacao };
}
