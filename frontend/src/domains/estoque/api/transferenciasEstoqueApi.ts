import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type {
  TransferenciaEstoqueCriacaoDto,
  TransferenciaEstoqueLeituraDto,
} from '../types/tiposTransferencia';

export async function listarTransferenciasEstoqueApi(): Promise<TransferenciaEstoqueLeituraDto[]> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<TransferenciaEstoqueLeituraDto[]>('/api/TransferenciasEstoque');
  return data;
}

export async function criarTransferenciaEstoqueApi(
  dto: TransferenciaEstoqueCriacaoDto,
): Promise<TransferenciaEstoqueLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<TransferenciaEstoqueLeituraDto>('/api/TransferenciasEstoque', dto);
  return data;
}

export async function receberTransferenciaEstoqueApi(id: number): Promise<TransferenciaEstoqueLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<TransferenciaEstoqueLeituraDto>(`/api/TransferenciasEstoque/${id}/receber`);
  return data;
}
