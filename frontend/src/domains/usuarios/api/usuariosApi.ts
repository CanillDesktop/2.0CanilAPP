import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type {
  ConfirmacaoSenhaDto,
  UsuarioAtualizacaoDto,
  UsuarioCadastroComConfirmacaoDto,
  UsuarioCadastroDto,
  UsuarioCriadoDto,
} from '../types/tiposUsuarios';

export async function criarUsuarioApi(dto: UsuarioCadastroDto): Promise<UsuarioCriadoDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<UsuarioCriadoDto>('/api/Usuarios', dto);
  return data;
}

export async function criarUsuarioComConfirmacaoApi(dto: UsuarioCadastroComConfirmacaoDto): Promise<UsuarioCriadoDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<UsuarioCriadoDto>('/api/Usuarios', dto);
  return data;
}

export async function listarUsuariosApi(): Promise<UsuarioCriadoDto[]> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<UsuarioCriadoDto[]>('/api/Usuarios');
  return data;
}

export async function atualizarUsuarioApi(id: number, dto: UsuarioAtualizacaoDto): Promise<UsuarioCriadoDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.put<UsuarioCriadoDto>(`/api/Usuarios/${id}`, dto);
  return data;
}

export async function removerUsuarioApi(id: number, dto: ConfirmacaoSenhaDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Usuarios/${id}`, { data: dto });
}

export async function inativarUsuarioApi(id: number, dto: ConfirmacaoSenhaDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.patch(`/api/Usuarios/${id}/inativar`, dto);
}
