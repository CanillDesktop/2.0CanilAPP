import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type { RetiradaEstoqueDto } from '../types/tiposEstoque';

export async function registrarRetiradaApi(dto: RetiradaEstoqueDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.post('/api/RetiradaEstoque', dto);
}
