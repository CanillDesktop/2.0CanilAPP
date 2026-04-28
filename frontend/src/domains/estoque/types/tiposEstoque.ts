import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';

export type { ItemEstoqueDto };

export type LinhaOperacionalEstoque = {
  id: number;
  nome: string;
  quantidade: number;
  minimo: number;
  validade: string;
  origem: 'produto' | 'medicamento' | 'insumo';
  status: 'ok' | 'baixo' | 'critico' | 'proximo_vencimento';
  ultimaMovimentacao: string;
  /** Menor validade entre lotes (ms). Opcional em linhas montadas sem este dado. */
  validadeMs?: number | null;
  /** Última movimentação (ms). Opcional em linhas montadas sem este dado. */
  movimentacaoMs?: number | null;
};

export type RetiradaEstoqueDto = {
  codigo: string;
  nomeOuDescricaoSimples: string;
  lote: string;
  de: string;
  para: string;
  quantidade: number;
  dataHoraRetirada: string;
};

export type RetiradaRequest = {
  loteId: string;
  quantidade: number;
  origem: string;
  destino: string;
};

export type RetiradaNavegacaoState = {
  produtoId: number;
  produtoNome: string;
  codItem: string;
  loteId: string;
  loteCodigo: string;
  quantidadeDisponivel: number;
  retornoRota?: string;
};
