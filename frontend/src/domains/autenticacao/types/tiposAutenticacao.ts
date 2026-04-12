import type { UsuarioSessao } from '../../../shared/types/usuarioSessao';

export type { UsuarioSessao };

export type CredenciaisLogin = {
  login: string;
  senha: string;
};

export type RespostaLogin = {
  token?: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
  };
  usuario?: UsuarioSessao;
};

export type CorpoRefresh = {
  refreshToken: string;
};
