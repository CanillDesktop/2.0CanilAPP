/** Tipos comuns de itens de estoque retornados pela API (camelCase). */

export type ItemNivelEstoqueDto = {
  id: number;
  nivelMinimoEstoque: number;
};

export type ItemEstoqueDto = {
  id: number;
  codigo: string;
  lote?: string | null;
  quantidade: number;
  dataEntrega: string;
  nfe?: string | null;
  dataValidade?: string | null;
};
