export type UsuarioCadastroComConfirmacaoDto = {
  primeiroNome: string;
  sobrenome?: string | null;
  email: string;
  senha: string;
  senhaConfirmacao: string;
  /** Ignorado no cadastro público: o servidor sempre cria como Leitura. */
  permissao?: number;
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
  email: string;
  /** Só aplicado quando um administrador edita outro usuário. */
  permissao?: number;
};

export type TrocarSenhaDto = {
  senhaAtual: string;
  novaSenha: string;
};

export type ConfirmacaoSenhaDto = {
  senhaConfirmacao: string;
};

export type FiltrosUsuarios = {
  busca?: string;
  status?: 'todos' | 'ativos' | 'inativos';
};
