/** Tipos comuns de itens de estoque retornados pela API (camelCase). */

export type ItemNivelEstoqueDto = {
  idItem: number;
  nivelMinimoEstoque: number;
};

export type ItemEstoqueDto = {
  idItem: number;
  codItem: string;
  lote?: string | null;
  quantidade: number;
  dataEntrega: string;
  nfe?: string | null;
  dataValidade?: string | null;
};
