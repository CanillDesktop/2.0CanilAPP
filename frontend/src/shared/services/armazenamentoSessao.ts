import type { UsuarioSessao } from '../types/usuarioSessao';

const CHAVE_ACCESS = 'canilapp_access_token';
const CHAVE_REFRESH = 'canilapp_refresh_token';
const CHAVE_USUARIO = 'canilapp_usuario';

export function salvarSessao(accessToken: string, refreshToken: string, usuario: UsuarioSessao): void {
  localStorage.setItem(CHAVE_ACCESS, accessToken);
  localStorage.setItem(CHAVE_REFRESH, refreshToken);
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export function obterAccessToken(): string | null {
  return localStorage.getItem(CHAVE_ACCESS);
}

export function obterRefreshToken(): string | null {
  return localStorage.getItem(CHAVE_REFRESH);
}

export function obterUsuarioArmazenado(): UsuarioSessao | null {
  const bruto = localStorage.getItem(CHAVE_USUARIO);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as UsuarioSessao;
  } catch {
    return null;
  }
}

export function limparSessao(): void {
  localStorage.removeItem(CHAVE_ACCESS);
  localStorage.removeItem(CHAVE_REFRESH);
  localStorage.removeItem(CHAVE_USUARIO);
}

export function atualizarTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(CHAVE_ACCESS, accessToken);
  localStorage.setItem(CHAVE_REFRESH, refreshToken);
}
