import type { UsuarioSessao } from '../../../shared/types/usuarioSessao';

export type { UsuarioSessao };

export type CredenciaisLogin = {
  login: string;
  senha: string;
};

export type RespostaLogin = {
  accessToken: string,
  usuario?: UsuarioSessao;
};