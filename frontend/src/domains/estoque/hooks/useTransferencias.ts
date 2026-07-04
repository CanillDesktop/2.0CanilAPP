import { useCallback, useState } from 'react';
import { capturarErroMutacao, ErroApi, type ResultadoMutacao } from '../../../infrastructure/http/erroApi';
import {
  criarTransferenciaEstoqueApi,
  listarTransferenciasEstoqueApi,
  receberTransferenciaEstoqueApi,
} from '../api/transferenciasEstoqueApi';
import type {
  TransferenciaEstoqueCriacaoDto,
  TransferenciaEstoqueLeituraDto,
} from '../types/tiposTransferencia';

export function useTransferenciasEstoque() {
  const [lista, setLista] = useState<TransferenciaEstoqueLeituraDto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarTransferenciasEstoqueApi();
      setLista(dados);
      return dados;
    } catch (e) {
      const falha = capturarErroMutacao<TransferenciaEstoqueLeituraDto[]>(e, 'Não foi possível carregar transferências.');
      setErro(!falha.ok ? falha.mensagem : null);
      setLista([]);
      return [];
    } finally {
      setCarregando(false);
    }
  }, []);

  const enviar = useCallback(async (dto: TransferenciaEstoqueCriacaoDto): Promise<ResultadoMutacao> => {
    setSalvando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await criarTransferenciaEstoqueApi(dto);
      return { ok: true };
    } catch (e) {
      const falha = capturarErroMutacao(e, 'Não foi possível enviar a transferência.');
      if (!falha.ok) setErro(falha.mensagem);
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
      return falha;
    } finally {
      setSalvando(false);
    }
  }, []);

  const receber = useCallback(async (id: number): Promise<ResultadoMutacao> => {
    setSalvando(true);
    setErro(null);
    try {
      await receberTransferenciaEstoqueApi(id);
      return { ok: true };
    } catch (e) {
      const falha = capturarErroMutacao(e, 'Não foi possível confirmar o recebimento.');
      if (!falha.ok) setErro(falha.mensagem);
      return falha;
    } finally {
      setSalvando(false);
    }
  }, []);

  return { lista, carregando, salvando, erro, errosValidacao, carregar, enviar, receber };
}
