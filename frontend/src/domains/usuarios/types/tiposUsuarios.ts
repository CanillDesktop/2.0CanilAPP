/** Corpo de criação de usuário (UsuarioRequestDTO). */
export type UsuarioCadastroDto = {
  id?: number | null;
  primeiroNome: string;
  sobrenome?: string | null;
  email: string;
  senha: string;
  /** Ignorado no cadastro público: o servidor sempre cria como Leitura. */
  permissao?: number;
};

export type UsuarioCadastroComConfirmacaoDto = UsuarioCadastroDto & {
  senhaConfirmacao: string;
};

export type UsuarioCriadoDto = {
  id?: number | null;
  email: string;
  primeiroNome: string;
  sobrenome?: string | null;
  permissao: number;
  dataHoraCriacao: string;
  dataHoraAtualizacao: string;
  isDeleted: boolean;
};

export type UsuarioAtualizacaoDto = {
  primeiroNome: string;
  sobrenome?: string | null;
  /** Só aplicado quando um administrador edita outro usuário. */
  permissao?: number;
};

export type ConfirmacaoSenhaDto = {
  senhaConfirmacao: string;
};

export type FiltrosUsuarios = {
  busca?: string;
  status?: 'todos' | 'ativos' | 'inativos';
};
