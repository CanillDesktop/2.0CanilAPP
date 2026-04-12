import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import type { InsumoCadastroDto, InsumoLeituraDto, InsumosFiltroDto } from '../types/tiposInsumos';

export async function listarInsumosApi(filtro?: InsumosFiltroDto): Promise<InsumoLeituraDto[]> {
  const cliente = obterClienteHttp();
  const qs = filtro ? montarQueryString(filtro as Record<string, string | number | undefined>) : '';
  const { data } = await cliente.get<InsumoLeituraDto[]>(`/api/Insumos${qs}`);
  return data;
}

export async function obterInsumoPorIdApi(id: number): Promise<InsumoLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<InsumoLeituraDto>(`/api/Insumos/${id}`);
  return data;
}

export async function criarInsumoApi(dto: InsumoCadastroDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.post('/api/Insumos', dto);
}

export async function atualizarInsumoApi(dto: InsumoCadastroDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.put('/api/Insumos', dto);
}

export async function excluirInsumoApi(id: number): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Insumos/${id}`);
}
