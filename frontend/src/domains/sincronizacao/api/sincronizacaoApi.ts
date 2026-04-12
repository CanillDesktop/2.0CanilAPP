import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';

export type MensagemCompatApi = { message: string };

export async function solicitarSincronizacaoApi(): Promise<MensagemCompatApi> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<MensagemCompatApi>('/api/Sync');
  return data;
}

export async function solicitarLimpezaSyncApi(): Promise<MensagemCompatApi> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<MensagemCompatApi>('/api/Sync/limpar');
  return data;
}
