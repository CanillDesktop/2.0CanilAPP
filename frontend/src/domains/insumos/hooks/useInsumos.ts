import { useCallback, useState } from 'react';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { useEstadoAssincrono } from '../../../shared/hooks/useEstadoAssincrono';
import { servicoInsumos } from '../services/servicoInsumos';
import type { InsumoCadastroDto, InsumoLeituraDto, InsumosFiltroDto } from '../types/tiposInsumos';

export function useListaInsumos() {
  const { estado, executar } = useEstadoAssincrono<InsumoLeituraDto[]>();
  const carregar = useCallback(
    (filtro?: InsumosFiltroDto) => executar(() => servicoInsumos.listar(filtro)),
    [executar],
  );
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

  const criar = useCallback(async (dto: InsumoCadastroDto) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoInsumos.criar(dto);
      return true;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  const excluir = useCallback(async (id: number) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoInsumos.excluir(id);
      return true;
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return false;
    } finally {
      setCarregando(false);
    }
  }, []);

  return { criar, excluir, carregando, erro, errosValidacao };
}
