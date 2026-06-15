import type { AxiosError } from 'axios';
import { MSG_ERRO, type ResultadoMutacao } from '../../shared/constants/mensagensErroUsuario';
import type { RespostaErroApi, RespostaErroValidacaoApi } from '../../shared/types/respostaErroApi';

export type { ResultadoMutacao };

/**
 * Erro de domínio da camada HTTP, normalizado para a UI.
 */
export class ErroApi extends Error {
  readonly statusCode: number;
  readonly corpo?: RespostaErroApi | RespostaErroValidacaoApi | unknown;
  readonly errors?: Record<string, string[]>;

  constructor(
    mensagem: string,
    statusCode: number,
    corpo?: RespostaErroApi | RespostaErroValidacaoApi | unknown,
    errors?: Record<string, string[]>,
  ) {
    super(mensagem);
    this.name = 'ErroApi';
    this.statusCode = statusCode;
    this.corpo = corpo;
    this.errors = errors;
  }

  extrairMensagemErros = (): string[] | null => {
    return this.errors ? Object.values(this.errors).flatMap((error) => error) : null;
  };
}

const PADROES_MENSAGEM_TECNICA = [
  /^request failed with status code \d+$/i,
  /^network error$/i,
  /^timeout of \d+ms exceeded$/i,
  /^canceled$/i,
  /^aborted$/i,
  /axios/i,
  /ECONNABORTED/i,
  /ERR_NETWORK/i,
];

function mensagemEhTecnica(mensagem: string): boolean {
  const t = mensagem.trim();
  if (!t) return true;
  return PADROES_MENSAGEM_TECNICA.some((padrao) => padrao.test(t));
}

function mensagemPorStatusHttp(status: number, mensagemOriginal?: string): string {
  if (status === 401) return MSG_ERRO.login401;
  if (status === 403) return MSG_ERRO.semPermissao;
  if (status === 404) return MSG_ERRO.naoEncontrado;
  if (status === 408) return MSG_ERRO.timeout;
  if (status >= 500) return MSG_ERRO.servidor;

  if (mensagemOriginal && !mensagemEhTecnica(mensagemOriginal)) {
    return mensagemOriginal;
  }

  return MSG_ERRO.operacao;
}

function mensagemErroRede(): string {
  return MSG_ERRO.rede;
}

/** Normaliza mensagens de falha para exibição ao usuário. */
export function extrairMensagemErroApi(erro: unknown): string {
  if (erro instanceof ErroApi) {
    if (erro.statusCode === 403) return MSG_ERRO.semPermissao;
    if (erro.statusCode === 0 && /network error/i.test(erro.message)) return mensagemErroRede();
    if (erro.statusCode === 408 || /timeout/i.test(erro.message)) return MSG_ERRO.timeout;
    if (erro.statusCode === 401) return MSG_ERRO.login401;
    if (erro.statusCode === 404) return MSG_ERRO.naoEncontrado;
    if (erro.statusCode >= 500) return MSG_ERRO.servidor;
    if (mensagemEhTecnica(erro.message)) return mensagemPorStatusHttp(erro.statusCode, erro.message);
    return erro.message;
  }

  const ax = erro as AxiosError<RespostaErroApi & { error?: string }>;
  const status = ax.response?.status ?? 0;

  if (status === 403) return MSG_ERRO.semPermissao;

  const dados = ax.response?.data;
  if (dados && typeof dados === 'object' && 'message' in dados && typeof dados.message === 'string') {
    const msg = dados.message.trim();
    if (msg && !mensagemEhTecnica(msg)) return msg;
  }
  if (dados && typeof dados === 'object' && 'error' in dados && typeof dados.error === 'string') {
    const msg = dados.error.trim();
    if (msg && !mensagemEhTecnica(msg)) return msg;
  }

  if (!ax.response && ax.message && /network error/i.test(ax.message)) {
    return mensagemErroRede();
  }

  if (status > 0) {
    return mensagemPorStatusHttp(status, ax.message);
  }

  if (ax.message && !mensagemEhTecnica(ax.message)) return ax.message;

  return MSG_ERRO.inesperado;
}

/** Converte exceção de mutação em resultado com mensagem amigável. */
export function capturarErroMutacao<T = void>(erro: unknown, mensagemPadrao: string): ResultadoMutacao<T> {
  const mensagem = extrairMensagemErroApi(erro);
  const usarPadrao =
    mensagem === MSG_ERRO.operacao ||
    mensagem === MSG_ERRO.inesperado ||
    mensagemEhTecnica(mensagem);

  return { ok: false, mensagem: usarPadrao ? mensagemPadrao : mensagem };
}
