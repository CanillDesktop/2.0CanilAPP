import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type { ContextoUnidadeEstoqueDto } from '../types/tiposUnidadeEstoque';

export async function obterContextoUnidadeEstoqueApi(): Promise<ContextoUnidadeEstoqueDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<ContextoUnidadeEstoqueDto>('/api/UnidadesEstoque/contexto');
  return data;
}
