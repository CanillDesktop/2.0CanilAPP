import {
  atualizarUsuarioApi,
  criarUsuarioApi,
  inativarUsuarioApi,
  listarUnidadesEstoqueUsuarioApi,
  listarUsuariosApi,
  obterUsuarioPorIdApi,
  reativarUsuarioApi,
  removerUsuarioApi,
  trocarSenhaUsuarioApi,
} from '../api/usuariosApi';
import type {
  ConfirmacaoSenhaDto,
  FiltrosUsuariosListagem,
  TrocarSenhaDto,
  UsuarioAtualizacaoDto,
  UsuarioCadastroComConfirmacaoDto,
  UsuarioCriadoDto,
  UsuarioUnidadeEstoqueDto,
  UsuariosPaginadosDto,
} from '../types/tiposUsuarios';

export const servicoUsuarios = {
  async criar(dto: UsuarioCadastroComConfirmacaoDto): Promise<UsuarioCriadoDto> {
    return criarUsuarioApi(dto);
  },
  async listar(filtros: FiltrosUsuariosListagem = {}): Promise<UsuariosPaginadosDto> {
    return listarUsuariosApi(filtros);
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
  async reativar(id: number, dto: ConfirmacaoSenhaDto): Promise<void> {
    await reativarUsuarioApi(id, dto);
  },
  async remover(id: number, dto: ConfirmacaoSenhaDto, hardDelete = false): Promise<void> {
    await removerUsuarioApi(id, dto, hardDelete);
  },
  async listarUnidadesEstoque(id: number): Promise<UsuarioUnidadeEstoqueDto[]> {
    return listarUnidadesEstoqueUsuarioApi(id);
  },
  async obterPorId(id: number): Promise<UsuarioCriadoDto> {
    return obterUsuarioPorIdApi(id);
  },
};
