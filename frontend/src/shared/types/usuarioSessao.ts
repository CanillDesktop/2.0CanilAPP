/** Resumo do usuário autenticado (espelha UsuarioResponseDTO do backend, serialização camelCase). */
export type UsuarioSessao = {
  id?: number | null;
  email: string;
  primeiroNome: string;
  sobrenome: string;
  permissao: number;
  /** Pode cadastrar/editar o catálogo de unidades de medida (Kg, Comprimido, etc.). */
  podeGerenciarUnidadesMedida?: boolean;
  dataHoraCriacao: Date;
  dataHoraAtualizacao: Date;
  isDeleted: boolean;
  /** 1=Ativo, 2=Inativo, 3=Excluido */
  status?: number;
  /** Permissões globais carregadas no login (códigos estáveis). */
  permissoesCodigos?: string[];
};