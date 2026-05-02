import { useCallback, useState } from 'react';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { useEstadoAssincrono } from '../../../shared/hooks/useEstadoAssincrono';
import { servicoMedicamentos } from '../services/servicoMedicamentos';
import type { MedicamentoCadastroDto, MedicamentosFiltroDto, MedicamentoLeituraDto } from '../types/tiposMedicamentos';

export function useListaMedicamentos() {
  const { estado, executar } = useEstadoAssincrono<MedicamentoLeituraDto[]>();
  const carregar = useCallback(
    (filtro?: MedicamentosFiltroDto) => executar(() => servicoMedicamentos.listar(filtro)),
    [executar],
  );
  return { estado, carregar };
}

export function useMedicamentoDetalhe(id: number | undefined) {
  const { estado, executar } = useEstadoAssincrono<MedicamentoLeituraDto>();
  const carregar = useCallback(() => {
    if (id == null) return Promise.resolve(null);
    return executar(() => servicoMedicamentos.obterPorId(id));
  }, [executar, id]);
  return { estado, carregar };
}

export function useMutacaoMedicamento() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);

  const criar = useCallback(async (dto: MedicamentoCadastroDto) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoMedicamentos.criar(dto);
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
      await servicoMedicamentos.excluir(id);
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
