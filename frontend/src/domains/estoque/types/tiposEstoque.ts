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
  observacao?: string;
  idUsuarioRecebedor?: number;
  /** Confirmação explícita do usuário para retirar mesmo com o lote vencido. */
  confirmarLoteVencido?: boolean;
};

export type PeriodoRapidoRetiradasDto = 'HOJE' | 'ULTIMOS_7_DIAS' | 'ULTIMOS_30_DIAS';

export type RetiradaHistoricoFiltroDto = {
  periodoRapido?: PeriodoRapidoRetiradasDto;
  /** ISO 8601 UTC (início do dia em UTC). Usado junto com DataFimUtc se PeriodoRapido estiver ausente. */
  dataInicioUtc?: string;
  dataFimUtc?: string;
  idUsuarioRetirante?: number;
  idUsuarioRecebedor?: number;
  termoBusca?: string;
};

export type RetiradaHistoricoMetricasDto = {
  totalRegistrosNoRecorte: number;
  somaQuantidadeItens: number;
  totalRetiradasFeitasPorUsuarioRetiranteFiltro?: number | null;
  totalRetiradasRecebidasPorUsuarioRecebedorFiltro?: number | null;
};

export type RetiradaHistoricoItemDto = {
  id: number;
  dataHoraRetirada: string;
  codigo: string;
  nomeProduto: string;
  lote: string;
  quantidade: number;
  usuarioRetiranteExibicao: string;
  idUsuarioRetirante?: number | null;
  usuarioRecebedorExibicao: string;
  idUsuarioRecebedor?: number | null;
  observacao?: string | null;
  status: string;
  /** Indica que o lote estava vencido no momento da retirada (autorizada pelo retirante). */
  estavaVencido?: boolean;
  /** Data de validade do lote retirado, quando aplicável. */
  dataValidadeLote?: string | null;
};

export type RetiradaHistoricoListaPaginadaDto = {
  items: RetiradaHistoricoItemDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  metricas: RetiradaHistoricoMetricasDto;
  dataInicioUtcAplicada: string;
  dataFimUtcInclusiveAplicada: string;
};

export type RetiradaPaginacaoDto = {
  pageNumber: number;
  pageSize: number;
  /** Ordenação server-side apenas por DataHoraRetirada: true = mais antigo primeiro. */
  ordemDataAscendente?: boolean;
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
