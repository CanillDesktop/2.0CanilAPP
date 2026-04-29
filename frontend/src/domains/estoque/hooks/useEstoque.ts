import { useCallback, useState } from 'react';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { useEstadoAssincrono } from '../../../shared/hooks/useEstadoAssincrono';
import { servicoEstoque } from '../services/servicoEstoque';
import type { ItemEstoqueDto, RetiradaEstoqueDto } from '../types/tiposEstoque';

export function useItemEstoqueDetalhe(id: number | undefined) {
  const { estado, executar } = useEstadoAssincrono<ItemEstoqueDto>();
  const carregar = useCallback(() => {
    if (id == null) return Promise.resolve(null);
    return executar(() => servicoEstoque.obterItemPorId(id));
  }, [executar, id]);
  return { estado, carregar };
}

export function useMutacaoEstoque() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);

  const criarLote = useCallback(async (dto: ItemEstoqueDto) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoEstoque.criarLote(dto);
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

  const registrarRetirada = useCallback(async (dto: RetiradaEstoqueDto) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoEstoque.registrarRetirada(dto);
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

  return { criarLote, registrarRetirada, carregando, erro, errosValidacao };
}
