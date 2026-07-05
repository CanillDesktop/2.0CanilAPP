export type PermissaoLeituraDto = {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string | null;
  categoria: string;
  escopoUnidadeEstoque: boolean;
  ehSistema: boolean;
};

export type PermissaoCadastroDto = {
  codigo: string;
  nome: string;
  descricao?: string | null;
  categoria: string;
  escopoUnidadeEstoque: boolean;
};

export type PermissaoAtualizacaoDto = {
  nome: string;
  descricao?: string | null;
  categoria: string;
};

export type PermissaoAtribuicaoLinhaDto = {
  idPermissao: number;
  codigo: string;
  nome: string;
  categoria: string;
  escopoUnidadeEstoque: boolean;
  ehSistema: boolean;
  atribuida: boolean;
  idUnidadeEstoque?: number | null;
  nomeUnidade?: string | null;
};

export type UsuarioPermissoesEditorDto = {
  idUsuario: number;
  linhas: PermissaoAtribuicaoLinhaDto[];
};

export type UsuarioPermissaoAtribuicaoSalvarDto = {
  idPermissao: number;
  idUnidadeEstoque?: number | null;
};

export type UsuarioPermissoesSalvarDto = {
  atribuicoes: UsuarioPermissaoAtribuicaoSalvarDto[];
};
