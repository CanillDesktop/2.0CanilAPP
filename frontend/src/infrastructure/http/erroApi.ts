import type { AxiosError } from 'axios';
import type { RespostaErroApi } from '../../shared/types/respostaErroApi';

/**
 * Erro de domínio da camada HTTP, normalizado para a UI.
 */
export class ErroApi extends Error {
  readonly statusCode: number;
  readonly corpo?: RespostaErroApi | unknown;

  constructor(mensagem: string, statusCode: number, corpo?: RespostaErroApi | unknown) {
    super(mensagem);
    this.name = 'ErroApi';
    this.statusCode = statusCode;
    this.corpo = corpo;
  }
}

export function extrairMensagemErroApi(erro: unknown): string {
  if (erro instanceof ErroApi) return erro.message;
  const ax = erro as AxiosError<RespostaErroApi & { error?: string }>;
  const dados = ax.response?.data;
  if (dados && typeof dados === 'object' && 'message' in dados && typeof dados.message === 'string') {
    return dados.message;
  }
  if (dados && typeof dados === 'object' && 'error' in dados && typeof dados.error === 'string') {
    return dados.error;
  }
  if (ax.message) return ax.message;
  return 'Erro inesperado ao comunicar com a API.';
}
