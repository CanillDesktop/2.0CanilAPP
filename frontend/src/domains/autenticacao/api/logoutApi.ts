import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';

/**
 * Chamadas HTTP do domínio de autenticação (sem regras de negócio).
 */
export async function solicitarLogoutApi(): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.post('/api/Auth/logout');
}