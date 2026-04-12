/** Corpo de criação de usuário (UsuarioRequestDTO). */
export type UsuarioCadastroDto = {
  id?: number | null;
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  permissao: number;
};

export type UsuarioCriadoDto = {
  id?: number | null;
  email: string;
  nome: string;
  sobrenome: string;
  permissao: number;
  cognitoSub?: string | null;
};
