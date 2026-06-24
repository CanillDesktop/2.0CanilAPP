/** Resumo do usuário autenticado (espelha UsuarioResponseDTO do backend, serialização camelCase). */
export type UsuarioSessao = {
  id?: number | null;
  email: string;
  primeiroNome: string;
  sobrenome: string;
  permissao: number;
  dataHoraCriacao: Date;
  dataHoraAtualizacao: Date;
  isDeleted: boolean;
  /** 1=Ativo, 2=Inativo, 3=Excluido */
  status?: number;
};