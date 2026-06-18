import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';

export type { ItemEstoqueDto };

/** Lote e código gerados pelo backend (somente para conferência na tela de cadastro de lote). */
export type ProximoLoteEstoqueDto = {
  codigo: string;
  lote: string;
};

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

/** Campos ordenáveis da listagem de estoque (mesmos nomes aceitos pelo backend). */
export type CampoOrdenacaoEstoque = 'nome' | 'quantidade' | 'validade' | 'status' | 'ultimaMovimentacao';

/** Status operacional aceito pelo backend (igual ao union de LinhaOperacionalEstoque['status']). */
export type EstoqueStatusOperacional = LinhaOperacionalEstoque['status'];

/** Mapeia a aba/origem para o enum EstoqueOrigem do backend (Produto=0, Medicamento=1, Insumo=2). */
export const ESTOQUE_ORIGEM_API = {
  produto: 0,
  medicamento: 1,
  insumo: 2,
} as const satisfies Record<LinhaOperacionalEstoque['origem'], number>;

/** Origem por número do enum (resposta do backend). */
export const ESTOQUE_ORIGEM_POR_NUMERO: Record<number, LinhaOperacionalEstoque['origem']> = {
  0: 'produto',
  1: 'medicamento',
  2: 'insumo',
};

/** Linha agregada retornada por GET /api/Estoque/pagination (EstoqueLinhaLeituraDTO). */
export type EstoqueLinhaDto = {
  id: number;
  nome: string;
  quantidade: number;
  minimo: number;
  validade: string;
  origem: number;
  statusOperacional: EstoqueStatusOperacional;
  ultimaMovimentacao: string;
  menorValidadeUtc?: string | null;
  ultimaMovimentacaoUtc?: string | null;
};

/** Filtros de negócio enviados para a listagem paginada de estoque. */
export type EstoqueFiltroDto = {
  origem: number;
  termoBusca?: string;
  statusOperacional?: EstoqueStatusOperacional | '';
  quantidadeMinima?: number;
  quantidadeMaxima?: number;
  validadeDe?: string;
  validadeAte?: string;
  movimentacaoDe?: string;
  movimentacaoAte?: string;
};

/** Paginação + ordenação server-side. */
export type EstoqueConsultaParametros = {
  pageNumber: number;
  pageSize: number;
  orderBy?: CampoOrdenacaoEstoque;
  sortDirection?: 'asc' | 'desc';
};

/** Envelope genérico de paginação (PagedResultDto<T>). */
export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

/** Totais por aba (GET /api/Estoque/contagens). */
export type EstoqueContagemPorOrigemDto = {
  produtos: number;
  medicamentos: number;
  insumos: number;
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
