import type { AxiosError } from 'axios';
import type { RespostaErroApi, RespostaErroValidacaoApi } from '../../shared/types/respostaErroApi';

/**
 * Erro de domínio da camada HTTP, normalizado para a UI.
 */
export class ErroApi extends Error {
  readonly statusCode: number;
  readonly corpo?: RespostaErroApi | RespostaErroValidacaoApi | unknown;
  readonly errors?: Record<string, string[]>;

  constructor(mensagem: string, statusCode: number, corpo?: RespostaErroApi | RespostaErroValidacaoApi | unknown, errors?: Record<string, string[]>) {
    super(mensagem);
    this.name = 'ErroApi';
    this.statusCode = statusCode;
    this.corpo = corpo;
    this.errors = errors;
  }

  extrairMensagemErros = () : string[] | null => {
    return this.errors ?
      Object.values(this.errors).flatMap(error => error)
      : null;
  }
}

export function extrairMensagemErroApi(erro: unknown): string {
  if (erro instanceof ErroApi) {
    if (erro.statusCode === 403) {
      return 'Você não tem permissão para acessar este recurso.';
    }
    if (erro.statusCode === 0 && /network error/i.test(erro.message)) {
      return 'Sem resposta da API (serviço parado, URL errada ou bloqueio CORS). Em dev, deixe VITE_URL_BASE_API vazio e use o proxy do Vite; confira se o backend está em 127.0.0.1:5000.';
    }
    return erro.message;
  }
  const ax = erro as AxiosError<RespostaErroApi & { error?: string }>;
  if (ax.response?.status === 403) {
    return 'Você não tem permissão para acessar este recurso.';
  }
  const dados = ax.response?.data;
  if (dados && typeof dados === 'object' && 'message' in dados && typeof dados.message === 'string') {
    return dados.message;
  }
  if (dados && typeof dados === 'object' && 'error' in dados && typeof dados.error === 'string') {
    return dados.error;
  }
  if (!ax.response && ax.message && /network error/i.test(ax.message)) {
    return 'Sem resposta da API (serviço parado, URL errada ou bloqueio CORS). Em dev, deixe VITE_URL_BASE_API vazio e use o proxy do Vite; confira se o backend está em 127.0.0.1:5000.';
  }
  if (ax.message) return ax.message;
  return 'Erro inesperado ao comunicar com a API.';
}
