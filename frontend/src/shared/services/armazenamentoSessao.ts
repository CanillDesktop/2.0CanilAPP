import type { UsuarioSessao } from '../types/usuarioSessao';
import { normalizarUsuarioSessao } from '../types/usuarioSessao';

const CHAVE_TOKEN = 'canilapp_access_token';
const CHAVE_USUARIO = 'canilapp_usuario';

export function salvarSessao(accessToken: string, usuario: UsuarioSessao): void {
  localStorage.setItem(CHAVE_TOKEN, accessToken);
  localStorage.setItem(
    CHAVE_USUARIO,
    JSON.stringify(normalizarUsuarioSessao(usuario as unknown as Record<string, unknown>)),
  );
}

export function obterAccessToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function obterUsuarioArmazenado(): UsuarioSessao | null {
  const bruto = localStorage.getItem(CHAVE_USUARIO);
  if (!bruto) return null;
  try {
    return normalizarUsuarioSessao(JSON.parse(bruto) as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function limparSessao(): void {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}

export function atualizarAccessToken(accessToken: string): void {
  localStorage.setItem(CHAVE_TOKEN, accessToken);
}

/** Atualiza o JSON do usuário na sessão sem novo login (ex.: após PUT de perfil). */
export function mesclarUsuarioArmazenado(atualizacao: Partial<UsuarioSessao>): void {
  const atual = obterUsuarioArmazenado();
  const token = obterAccessToken();
  if (!atual || !token) return;
  salvarSessao(token, { ...atual, ...atualizacao });
}
