/** Padroniza o e-mail de login (trim + minúsculas). */
export function normalizarEmailLogin(email: string): string {
  return email.trim().toLowerCase();
}

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Retorna mensagem de erro se o e-mail for inválido; caso contrário, `null`. */
export function validarEmailLogin(email: string): string | null {
  const normalizado = normalizarEmailLogin(email);
  if (!normalizado) {
    return 'E-mail é obrigatório.';
  }
  if (!PADRAO_EMAIL.test(normalizado)) {
    return 'Formato de e-mail inválido.';
  }
  return null;
}
