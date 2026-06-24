import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type { EntradaEstoqueDto } from '../types/tiposEntradaEstoque';

export async function registrarEntradaEstoqueApi(dto: EntradaEstoqueDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.post('/api/Estoque/entradas', dto);
}
