/** Espelha StatusUsuario do backend. */
export const StatusUsuario = {
  Ativo: 1,
  Inativo: 2,
  Excluido: 3,
} as const;

export type StatusUsuarioValor = (typeof StatusUsuario)[keyof typeof StatusUsuario];

export type UsuarioCadastroComConfirmacaoDto = {
  primeiroNome: string;
  sobrenome?: string | null;
  email: string;
  senha: string;
  senhaConfirmacao: string;
  /** Ignorado no cadastro público: o servidor sempre cria como Leitura. */
  permissao?: number;
  unidadesEstoque?: UsuarioUnidadeEstoqueAtribuicaoDto[];
};

export type UsuarioUnidadeEstoqueDto = {
  idUnidadeEstoque: number;
  nomeUnidade: string;
  siglaUnidade: string;
  podeConsultar: boolean;
  podeEntrada: boolean;
  podeSaida: boolean;
  podeTransferirEnviar: boolean;
  podeTransferirReceber: boolean;
};

export type UsuarioUnidadeEstoqueAtribuicaoDto = {
  idUnidadeEstoque: number;
  podeConsultar?: boolean;
  podeEntrada: boolean;
  podeSaida: boolean;
  podeTransferirEnviar: boolean;
  podeTransferirReceber: boolean;
};

export type UsuarioCriadoDto = {
  id?: number | null;
  email: string;
  primeiroNome: string;
  sobrenome?: string | null;
  permissao: number;
  /** Catálogo de unidades de medida (Kg, Comprimido…). Admin sempre tem. */
  podeGerenciarUnidadesMedida?: boolean;
  dataHoraCriacao: string;
  dataHoraAtualizacao: string;
  /** Legado: true quando status !== Ativo. */
  isDeleted: boolean;
  status: StatusUsuarioValor;
  inactivatedAt?: string | null;
  inactivatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  reactivatedAt?: string | null;
  reactivatedBy?: string | null;
};

export type UsuarioAtualizacaoDto = {
  primeiroNome: string;
  sobrenome?: string | null;
  email: string;
  /** Só aplicado quando um administrador edita outro usuário. */
  permissao?: number;
  podeGerenciarUnidadesMedida?: boolean;
  unidadesEstoque?: UsuarioUnidadeEstoqueAtribuicaoDto[];
};

export type TrocarSenhaDto = {
  senhaAtual: string;
  novaSenha: string;
};

export type ConfirmacaoSenhaDto = {
  senhaConfirmacao: string;
};

export type UsuarioResumoFiltroDto = {
  id: number;
  nomeExibicao: string;
};

export type FiltrosUsuariosListagem = {
  busca?: string;
  status?: 'todos' | 'ativos' | 'inativos' | 'excluidos';
  pageNumber?: number;
  pageSize?: number;
};

export type UsuariosPaginadosDto = {
  items: UsuarioCriadoDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export function rotuloStatusUsuario(status: StatusUsuarioValor): string {
  if (status === StatusUsuario.Ativo) return 'Ativo';
  if (status === StatusUsuario.Inativo) return 'Inativo';
  return 'Excluído';
}

export function mapaStatusApi(status: FiltrosUsuariosListagem['status']): string {
  switch (status) {
    case 'inativos':
      return 'inativo';
    case 'excluidos':
      return 'excluido';
    case 'todos':
      return 'todos';
    default:
      return 'ativo';
  }
}
