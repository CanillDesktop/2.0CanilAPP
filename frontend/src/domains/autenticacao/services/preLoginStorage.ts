/**
 * Persistência do estado do pré-login (acesso por código).
 *
 * Em vez de uma marca booleana "já passou", guardamos a VERSÃO do código de
 * acesso que foi validada. Assim, quando o administrador altera o código (a
 * versão muda no backend), o marcador salvo deixa de coincidir e o pré-login
 * passa a ser exigido novamente antes do login — para qualquer usuário.
 */
const CHAVE_PRE_LOGIN_VERSAO = 'canilapp_pre_login_versao';

export function versaoPreLoginValidada(): string | null {
  try {
    return window.localStorage.getItem(CHAVE_PRE_LOGIN_VERSAO);
  } catch {
    return null;
  }
}

/** Verdadeiro somente se a versão validada localmente é igual à versão atual do código. */
export function preLoginConcluido(versaoAtual: string | null | undefined): boolean {
  if (!versaoAtual) return false;
  return versaoPreLoginValidada() === versaoAtual;
}

export function marcarPreLoginConcluido(versao: string): void {
  try {
    window.localStorage.setItem(CHAVE_PRE_LOGIN_VERSAO, versao);
  } catch {
    /* armazenamento indisponível: o pré-login será solicitado novamente */
  }
}

export function limparPreLogin(): void {
  try {
    window.localStorage.removeItem(CHAVE_PRE_LOGIN_VERSAO);
  } catch {
    /* ignore */
  }
}
