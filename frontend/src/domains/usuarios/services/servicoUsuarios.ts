import { criarUsuarioApi } from '../api/usuariosApi';
import type { UsuarioCadastroDto, UsuarioCriadoDto } from '../types/tiposUsuarios';

export const servicoUsuarios = {
  async criar(dto: UsuarioCadastroDto): Promise<UsuarioCriadoDto> {
    return criarUsuarioApi(dto);
  },
};
