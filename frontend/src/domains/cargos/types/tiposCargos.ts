export type CargoLeituraDto = {
  id: number;
  nome: string;
  descricao?: string | null;
  ehAdministradorSistema: boolean;
  ehSistema: boolean;
  totalUsuarios: number;
};

export type CargoCadastroDto = {
  nome: string;
  descricao?: string | null;
};

export type CargoAtualizacaoDto = {
  nome: string;
  descricao?: string | null;
};

export type CargoPermissaoAtribuicaoLinhaDto = {
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

export type CargoPermissoesEditorDto = {
  idCargo: number;
  nomeCargo: string;
  ehAdministradorSistema: boolean;
  linhas: CargoPermissaoAtribuicaoLinhaDto[];
};

export type CargoPermissaoAtribuicaoSalvarDto = {
  idPermissao: number;
  idUnidadeEstoque?: number | null;
};

export type CargoPermissoesSalvarDto = {
  atribuicoes: CargoPermissaoAtribuicaoSalvarDto[];
};

export const CARGO_PADRAO = {
  administrador: 1,
  grupoPadrao: 2,
  /** @deprecated use grupoPadrao */
  leitura: 2,
} as const;

export const NOME_CARGO_PADRAO = {
  administrador: 'Administrador',
  grupoPadrao: 'Grupo Padrão',
} as const;
