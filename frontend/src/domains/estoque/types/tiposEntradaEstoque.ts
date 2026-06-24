export const TipoEntradaEstoque = {
  Compra: 1,
  Doacao: 2,
} as const;

export type TipoEntradaEstoqueValor = (typeof TipoEntradaEstoque)[keyof typeof TipoEntradaEstoque];

export type EntradaEstoqueDto = {
  idItem: number;
  tipoEntrada: TipoEntradaEstoqueValor;
  quantidade: number;
  dataEntrega: string;
  dataValidade?: string | null;
  nfe?: string | null;
  fornecedorNome?: string | null;
  fornecedorDocumento?: string | null;
  doadorNome?: string | null;
  doadorDocumento?: string | null;
  observacao?: string | null;
  nivelMinimoEstoque?: number | null;
};
