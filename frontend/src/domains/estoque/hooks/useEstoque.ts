import { useCallback, useState } from 'react';
import { capturarErroMutacao, ErroApi, type ResultadoMutacao } from '../../../infrastructure/http/erroApi';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
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

  const criarLote = useCallback(async (dto: ItemEstoqueDto): Promise<ResultadoMutacao<ItemEstoqueDto>> => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      const criado = await servicoEstoque.criarLote(dto);
      return { ok: true, dados: criado };
    } catch (e) {
      const falha = capturarErroMutacao(e, MSG_ERRO.lote);
      if (!falha.ok) setErro(falha.mensagem);
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return falha as ResultadoMutacao<ItemEstoqueDto>;
    } finally {
      setCarregando(false);
    }
  }, []);

  const registrarRetirada = useCallback(async (dto: RetiradaEstoqueDto): Promise<ResultadoMutacao> => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoEstoque.registrarRetirada(dto);
      return { ok: true };
    } catch (e) {
      const falha = capturarErroMutacao(e, MSG_ERRO.retirada);
      if (!falha.ok) setErro(falha.mensagem);
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return falha;
    } finally {
      setCarregando(false);
    }
  }, []);

  return { criarLote, registrarRetirada, carregando, erro, errosValidacao };
}
