import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type {
  UsuarioPermissoesEditorDto,
  UsuarioPermissoesSalvarDto,
} from '../../permissoes/types/tiposPermissoes';
import type {
  ConfirmacaoSenhaDto,
  FiltrosUsuariosListagem,
  TrocarSenhaDto,
  UsuarioAtualizacaoDto,
  UsuarioCadastroComConfirmacaoDto,
  UsuarioCriadoDto,
  UsuarioResumoFiltroDto,
  UsuarioUnidadeEstoqueDto,
  UsuariosPaginadosDto,
} from '../types/tiposUsuarios';
import { mapaStatusApi } from '../types/tiposUsuarios';
export async function criarUsuarioApi(dto: UsuarioCadastroComConfirmacaoDto): Promise<UsuarioCriadoDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<UsuarioCriadoDto>('/api/Usuarios', dto);
  return data;
}

export async function listarUsuariosApi(filtros: FiltrosUsuariosListagem = {}): Promise<UsuariosPaginadosDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<UsuariosPaginadosDto>('/api/Usuarios', {
    params: {
      status: mapaStatusApi(filtros.status),
      busca: filtros.busca?.trim() || undefined,
      pageNumber: filtros.pageNumber ?? 1,
      pageSize: filtros.pageSize ?? 8,
    },
  });
  return data;
}

export async function listarUsuariosResumoParaRetiradasApi(): Promise<UsuarioResumoFiltroDto[]> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<UsuarioResumoFiltroDto[]>('/api/Usuarios/resumo-filtro-retiradas');
  return data;
}

export async function obterUsuarioPorIdApi(id: number): Promise<UsuarioCriadoDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<UsuarioCriadoDto>(`/api/Usuarios/${id}`);
  return data;
}

export async function listarUnidadesEstoqueUsuarioApi(id: number): Promise<UsuarioUnidadeEstoqueDto[]> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<UsuarioUnidadeEstoqueDto[]>(`/api/Usuarios/${id}/unidades-estoque`);
  return data;
}

export async function atualizarUsuarioApi(id: number, dto: UsuarioAtualizacaoDto): Promise<UsuarioCriadoDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.put<UsuarioCriadoDto>(`/api/Usuarios/${id}`, dto);
  return data;
}

export async function trocarSenhaUsuarioApi(id: number, dto: TrocarSenhaDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.patch(`/api/Usuarios/${id}/alterar-senha`, dto);
}

export async function removerUsuarioApi(
  id: number,
  dto: ConfirmacaoSenhaDto,
  hardDelete = false,
): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Usuarios/${id}`, {
    params: { hardDelete },
    data: dto,
  });
}

export async function inativarUsuarioApi(id: number, dto: ConfirmacaoSenhaDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.patch(`/api/Usuarios/${id}/inativar`, dto);
}

export async function reativarUsuarioApi(id: number, dto: ConfirmacaoSenhaDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.patch(`/api/Usuarios/${id}/reativar`, dto);
}

export async function obterPermissoesAtribuicoesUsuarioApi(id: number): Promise<UsuarioPermissoesEditorDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<UsuarioPermissoesEditorDto>(`/api/Usuarios/${id}/permissoes-atribuicoes`);
  return data;
}

export async function salvarPermissoesAtribuicoesUsuarioApi(
  id: number,
  dto: UsuarioPermissoesSalvarDto,
): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.put(`/api/Usuarios/${id}/permissoes-atribuicoes`, dto);
}
