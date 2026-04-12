import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type { ItemEstoqueDto } from '../types/tiposEstoque';

export async function obterItemEstoquePorIdApi(id: number): Promise<ItemEstoqueDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<ItemEstoqueDto>(`/api/Estoque/${id}`);
  return data;
}

export async function criarItemEstoqueApi(dto: ItemEstoqueDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.post('/api/Estoque', dto);
}

export async function atualizarItemEstoqueApi(lote: string, dto: ItemEstoqueDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.put(`/api/Estoque/${encodeURIComponent(lote)}`, dto);
}

export async function excluirItemEstoqueApi(lote: string): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Estoque/${encodeURIComponent(lote)}`);
}
