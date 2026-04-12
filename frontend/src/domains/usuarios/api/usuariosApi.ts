import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type { UsuarioCadastroDto, UsuarioCriadoDto } from '../types/tiposUsuarios';

export async function criarUsuarioApi(dto: UsuarioCadastroDto): Promise<UsuarioCriadoDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<UsuarioCriadoDto>('/api/Usuarios', dto);
  return data;
}
