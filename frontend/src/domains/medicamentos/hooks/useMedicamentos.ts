import { useCallback, useRef, useState } from 'react';
import { capturarErroMutacao, ErroApi, extrairMensagemErroApi, type ResultadoMutacao } from '../../../infrastructure/http/erroApi';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
import { useEstadoAssincrono } from '../../../shared/hooks/useEstadoAssincrono';
import { servicoMedicamentos } from '../services/servicoMedicamentos';
import type {
  MedicamentoCadastroDto,
  MedicamentoFiltro,
  MedicamentoLeituraDto,
  MedicamentoPaginacaoDto,
  MedicamentosListaPaginadaDto,
} from '../types/tiposMedicamentos';

/**
 * Lista paginada com proteção contra race: respostas antigas são ignoradas.
 * Mantém o último resultado bem-sucedido em erro de rede (evita tabela vazia).
 */
export function useListaMedicamentosPaginados() {
  const [estado, setEstado] = useState<{
    dados: MedicamentosListaPaginadaDto | null;
    carregando: boolean;
    erro: string | null;
  }>({ dados: null, carregando: false, erro: null });
  const seqRef = useRef(0);

  const carregar = useCallback(async (filtro?: MedicamentoFiltro, paginacao?: MedicamentoPaginacaoDto) => {
    const id = ++seqRef.current;
    setEstado((s) => ({ ...s, carregando: true, erro: null }));
    try {
      const dados = await servicoMedicamentos.listarPaginado(filtro, paginacao);
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
