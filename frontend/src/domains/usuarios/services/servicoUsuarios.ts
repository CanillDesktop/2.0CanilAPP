import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import {
  atualizarUsuarioApi,
  criarUsuarioApi,
  criarUsuarioComConfirmacaoApi,
  inativarUsuarioApi,
  listarUsuariosApi,
  removerUsuarioApi,
} from '../api/usuariosApi';
import type {
  ConfirmacaoSenhaDto,
  UsuarioAtualizacaoDto,
  UsuarioCadastroComConfirmacaoDto,
  UsuarioCadastroDto,
  UsuarioCriadoDto,
} from '../types/tiposUsuarios';

export const servicoUsuarios = {
  async criar(dto: UsuarioCadastroDto): Promise<UsuarioCriadoDto> {
    return criarUsuarioApi(dto);
  },
  async criarComConfirmacao(dto: UsuarioCadastroComConfirmacaoDto): Promise<UsuarioCriadoDto> {
    return criarUsuarioComConfirmacaoApi(dto);
  },
  async listar(): Promise<UsuarioCriadoDto[]> {
    return listarUsuariosApi();
  },
  async atualizar(id: number, dto: UsuarioAtualizacaoDto): Promise<UsuarioCriadoDto> {
    return atualizarUsuarioApi(id, dto);
  },
  async inativar(id: number, dto: ConfirmacaoSenhaDto): Promise<void> {
    await inativarUsuarioApi(id, dto);
  },
  async remover(id: number, dto: ConfirmacaoSenhaDto): Promise<void> {
    await removerUsuarioApi(id, dto);
  },
  async confirmarSenha(senhaConfirmacao: string): Promise<boolean> {
    const cliente = obterClienteHttp();
    await cliente.post('/api/Auth/confirmar-senha', { senhaConfirmacao });
    return true;
  },
};
