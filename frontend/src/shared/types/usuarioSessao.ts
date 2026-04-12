/** Resumo do usuário autenticado (espelha UsuarioResponseDTO do backend, serialização camelCase). */
export type UsuarioSessao = {
  id?: number | null;
  email: string;
  nome: string;
  sobrenome: string;
  permissao: number;
  cognitoSub?: string | null;
};
