import { useCallback, useState } from 'react';
import { capturarErroMutacao, ErroApi, type ResultadoMutacao } from '../../../infrastructure/http/erroApi';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
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

  const criar = useCallback(async (dto: MedicamentoCadastroDto): Promise<ResultadoMutacao> => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao(null);
    try {
      await servicoMedicamentos.criar(dto);
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
      await servicoMedicamentos.excluir(id);
      return { ok: true };
    } catch (e) {
      const falha = capturarErroMutacao(e, MSG_ERRO.excluirMedicamento);
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
