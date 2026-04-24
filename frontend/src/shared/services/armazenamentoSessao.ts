import type { UsuarioSessao } from '../types/usuarioSessao';

const CHAVE_ACCESS = 'canilapp_access_token';
const CHAVE_USUARIO = 'canilapp_usuario';

export function salvarSessao(accessToken: string, usuario: UsuarioSessao): void {
  localStorage.setItem(CHAVE_ACCESS, accessToken);
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export function obterAccessToken(): string | null {
  return localStorage.getItem(CHAVE_ACCESS);
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
  localStorage.removeItem(CHAVE_USUARIO);
}

export function atualizarTokens(accessToken: string): void {
  localStorage.setItem(CHAVE_ACCESS, accessToken);
}
