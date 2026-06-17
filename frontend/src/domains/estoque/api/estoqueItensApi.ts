import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type { ItemEstoqueDto, ProximoLoteEstoqueDto } from '../types/tiposEstoque';

export async function obterItemEstoquePorIdApi(id: number): Promise<ItemEstoqueDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<ItemEstoqueDto>(`/api/Estoque/${id}`);
  return data;
}

/** Lote (e código) gerados pelo backend para conferência. O usuário não edita esses valores. */
export async function obterProximoLoteEstoqueApi(itemId: number): Promise<ProximoLoteEstoqueDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<ProximoLoteEstoqueDto>(`/api/Estoque/proximo-lote/${itemId}`);
  return data;
}

/** Consulta um lote específico por código + lote (usado para revalidar saldo antes da retirada). */
export async function obterItemEstoquePorCodigoELoteApi(
  codigo: string,
  lote: string,
): Promise<ItemEstoqueDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<ItemEstoqueDto>(
    `/api/Estoque/${encodeURIComponent(codigo)}/${encodeURIComponent(lote)}`,
  );
  return data;
}

export async function criarItemEstoqueApi(dto: ItemEstoqueDto): Promise<ItemEstoqueDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<ItemEstoqueDto>('/api/Estoque', dto);
  return data;
}

export async function atualizarItemEstoqueApi(lote: string, dto: ItemEstoqueDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.put(`/api/Estoque/${encodeURIComponent(lote)}`, dto);
}

export async function excluirItemEstoqueApi(lote: string): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Estoque/${encodeURIComponent(lote)}`);
}
