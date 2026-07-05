/** Resumo do usuário autenticado (espelha UsuarioResponseDTO do backend, serialização camelCase). */
export type UsuarioSessao = {
  id?: number | null;
  email: string;
  primeiroNome: string;
  sobrenome: string;
  idCargo: number;
  nomeCargo: string;
  ehAdministradorSistema?: boolean;
  /** @deprecated use idCargo / nomeCargo */
  permissao?: number;
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

export function normalizarUsuarioSessao(raw: Record<string, unknown>): UsuarioSessao {
  const idCargo = Number(raw.idCargo ?? raw.permissao ?? 2);
  return {
    ...(raw as unknown as UsuarioSessao),
    idCargo,
    nomeCargo: String(raw.nomeCargo ?? (idCargo === 1 ? 'Administrador' : 'Grupo Padrão')),
    ehAdministradorSistema: Boolean(raw.ehAdministradorSistema ?? idCargo === 1),
    permissao: idCargo,
  };
}
