/** Opções de unidade (espelha `UnidadeInsumosEnum` do backend). */
export const OPCOES_UNIDADE_INSUMO: { valor: number; rotulo: string }[] = [
  { valor: 1, rotulo: 'Ampola' },
  { valor: 2, rotulo: 'Bandeja' },
  { valor: 3, rotulo: 'Barra' },
  { valor: 4, rotulo: 'Caixa' },
  { valor: 5, rotulo: 'Comprimido' },
  { valor: 6, rotulo: 'Frasco' },
  { valor: 7, rotulo: 'Galão' },
  { valor: 8, rotulo: 'Kit' },
  { valor: 9, rotulo: 'Par' },
  { valor: 10, rotulo: 'Pacote' },
  { valor: 11, rotulo: 'Peça' },
  { valor: 12, rotulo: 'Rolo' },
  { valor: 13, rotulo: 'Tubo' },
  { valor: 14, rotulo: 'Unidade' },
  { valor: 15, rotulo: 'Vidro' },
  { valor: 16, rotulo: 'Quilo' },
  { valor: 17, rotulo: 'Litro' },
  { valor: 18, rotulo: 'Grama' },
  { valor: 19, rotulo: 'Mililitro' },
  { valor: 20, rotulo: 'Metro' },
  { valor: 21, rotulo: 'Centímetros' },
];

const ROTULOS_UNIDADE_INSUMO = Object.fromEntries(
  OPCOES_UNIDADE_INSUMO.map((opcao) => [opcao.valor, opcao.rotulo]),
) as Record<number, string>;

export function rotuloUnidadeInsumo(unidade: number): string {
  return ROTULOS_UNIDADE_INSUMO[unidade] ?? `Unidade ${unidade}`;
}
