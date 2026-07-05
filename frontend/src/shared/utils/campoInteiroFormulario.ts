/** Valor editável de campo numérico inteiro (vazio = ainda não informado). */
export type ValorCampoInteiro = number | '';

export function valorCampoInteiroDeInput(valor: string): ValorCampoInteiro {
  return valor === '' ? '' : Number(valor);
}

export function inteiroCampoParaEnvio(valor: ValorCampoInteiro, padrao = 0): number {
  return valor === '' ? padrao : valor;
}

export function campoInteiroPositivo(valor: ValorCampoInteiro): valor is number {
  return valor !== '' && Number.isFinite(valor) && valor > 0;
}
