import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type { CorpoRefresh, CredenciaisLogin, RespostaLogin } from '../types/tiposAutenticacao';

/**
 * Chamadas HTTP do domínio de autenticação (sem regras de negócio).
 */
export async function solicitarLoginApi(corpo: CredenciaisLogin): Promise<RespostaLogin> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<RespostaLogin>('/api/Login', corpo);
  return data;
}

export type TokenRespostaApi = NonNullable<RespostaLogin['token']>;

export async function solicitarRenovacaoTokenApi(refreshToken: string): Promise<TokenRespostaApi> {
  const cliente = obterClienteHttp();
  const corpo: CorpoRefresh = { refreshToken };
  const { data } = await cliente.post<TokenRespostaApi>('/api/Login/refresh', corpo);
  return data;
}
