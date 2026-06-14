import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type { CredenciaisLogin, RespostaLogin } from '../types/tiposAutenticacao';

/**
 * Chamadas HTTP do domínio de autenticação (sem regras de negócio).
 */
export async function solicitarLoginApi(corpo: CredenciaisLogin): Promise<RespostaLogin> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<RespostaLogin>('/api/Auth/login', corpo);
  return data;
}