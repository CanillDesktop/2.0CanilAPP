import {
  atualizarPermissaoApi,
  criarPermissaoApi,
  excluirPermissaoApi,
  listarPermissoesApi,
} from '../api/permissoesApi';
import type {
  PermissaoAtualizacaoDto,
  PermissaoCadastroDto,
  PermissaoLeituraDto,
} from '../types/tiposPermissoes';

export const servicoPermissoes = {
  listar(): Promise<PermissaoLeituraDto[]> {
    return listarPermissoesApi();
  },
  criar(dto: PermissaoCadastroDto): Promise<PermissaoLeituraDto> {
    return criarPermissaoApi(dto);
  },
  atualizar(id: number, dto: PermissaoAtualizacaoDto): Promise<PermissaoLeituraDto> {
    return atualizarPermissaoApi(id, dto);
  },
  excluir(id: number): Promise<void> {
    return excluirPermissaoApi(id);
  },
};
