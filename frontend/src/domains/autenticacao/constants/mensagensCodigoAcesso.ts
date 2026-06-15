/** Mensagens de regra de negócio do pré-login (código de acesso). */
export const MSG_CODIGO_ACESSO = {
  obrigatorio: 'Informe o código de acesso.',
  formatoInvalido: 'Formato do código inválido. Use de 4 a 64 caracteres, sem espaços.',
  invalido: 'Código inválido.',
  falhaValidacao: 'Não foi possível validar o código. Tente novamente.',
  inesperado: 'Ocorreu um erro inesperado.',
} as const;

const COMPRIMENTO_MINIMO = 4;
const COMPRIMENTO_MAXIMO = 64;

/**
 * Validação de formato espelhando a regra do backend (somente pré-checagem de UX).
 * Retorna a mensagem de erro ou null se o formato for aceitável.
 */
export function validarFormatoCodigoAcesso(codigo: string): string | null {
  const valor = codigo.trim();
  if (!valor) return MSG_CODIGO_ACESSO.obrigatorio;
  if (valor.length < COMPRIMENTO_MINIMO || valor.length > COMPRIMENTO_MAXIMO || /\s/.test(valor)) {
    return MSG_CODIGO_ACESSO.formatoInvalido;
  }
  return null;
}
