import {
  atualizarUsuarioApi,
  criarUsuarioApi,
  inativarUsuarioApi,
  listarUsuariosApi,
  removerUsuarioApi,
  trocarSenhaUsuarioApi,
} from '../api/usuariosApi';
import type {
  ConfirmacaoSenhaDto,
  TrocarSenhaDto,
  UsuarioAtualizacaoDto,
  UsuarioCadastroComConfirmacaoDto,
  UsuarioCriadoDto,
} from '../types/tiposUsuarios';

export const servicoUsuarios = {
  async criar(dto: UsuarioCadastroComConfirmacaoDto): Promise<UsuarioCriadoDto> {
    return criarUsuarioApi(dto);
  },
  async listar(): Promise<UsuarioCriadoDto[]> {
    return listarUsuariosApi();
  },
  async atualizar(id: number, dto: UsuarioAtualizacaoDto): Promise<UsuarioCriadoDto> {
    return atualizarUsuarioApi(id, dto);
  },
  async trocarSenha(id: number, dto: TrocarSenhaDto): Promise<void> {
    await trocarSenhaUsuarioApi(id, dto);
  },
  async inativar(id: number, dto: ConfirmacaoSenhaDto): Promise<void> {
    await inativarUsuarioApi(id, dto);
  },
  async remover(id: number, dto: ConfirmacaoSenhaDto): Promise<void> {
    await removerUsuarioApi(id, dto);
  }
};
