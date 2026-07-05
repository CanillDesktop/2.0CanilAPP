import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type {
  PermissaoAtualizacaoDto,
  PermissaoCadastroDto,
  PermissaoLeituraDto,
} from '../types/tiposPermissoes';

export async function listarPermissoesApi(): Promise<PermissaoLeituraDto[]> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<PermissaoLeituraDto[]>('/api/Permissoes');
  return data;
}

export async function criarPermissaoApi(dto: PermissaoCadastroDto): Promise<PermissaoLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<PermissaoLeituraDto>('/api/Permissoes', dto);
  return data;
}

export async function atualizarPermissaoApi(
  id: number,
  dto: PermissaoAtualizacaoDto,
): Promise<PermissaoLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.put<PermissaoLeituraDto>(`/api/Permissoes/${id}`, dto);
  return data;
}

export async function excluirPermissaoApi(id: number): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Permissoes/${id}`);
}
