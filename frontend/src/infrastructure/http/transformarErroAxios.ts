import type { AxiosError } from 'axios';
import { MSG_ERRO } from '../../shared/constants/mensagensErroUsuario';
import type { RespostaErroApi, RespostaErroValidacaoApi } from '../../shared/types/respostaErroApi';
import { isRespostaErroApi, isRespostaErroValidacaoApi } from '../../shared/types/respostaErroApi';
import { ErroApi } from './erroApi';

/** Converte falha bruta do Axios em {@link ErroApi} para a UI. */
export async function transformarErroAxios(erro: AxiosError): Promise<ErroApi> {
  const status = erro.response?.status ?? 0;
  let dados: unknown = erro.response?.data;

  let mensagem: string = MSG_ERRO.operacao;
  let erros;

  if (dados instanceof Blob) {
    try {
      const texto = await dados.text();
      dados = JSON.parse(texto) as unknown;
    } catch {
      dados = undefined;
    }
  }

  if (dados && isRespostaErroValidacaoApi(dados)) {
    mensagem = MSG_ERRO.validacaoResumo;
    erros = (dados as RespostaErroValidacaoApi).errors;
  } else if (dados && isRespostaErroApi(dados)) {
    const detalhe = (dados as RespostaErroApi).details?.trim();
    mensagem = detalhe && detalhe.length > 0 ? detalhe : MSG_ERRO.operacao;
  } else if (erro.message && !/^(network error|timeout|canceled|aborted)$/i.test(erro.message.trim())) {
    mensagem = erro.message;
  }

  if (status === 403) {
    mensagem = MSG_ERRO.semPermissao;
  } else if (status === 401) {
    mensagem = MSG_ERRO.login401;
  } else if (status === 404) {
    mensagem = MSG_ERRO.naoEncontrado;
  } else if (status === 408) {
    mensagem = MSG_ERRO.timeout;
  } else if (status >= 500) {
    mensagem = MSG_ERRO.servidor;
  } else if (status === 0 && /network error/i.test(erro.message ?? '')) {
    mensagem = MSG_ERRO.rede;
  }

  return new ErroApi(mensagem, status, dados, erros);
}
