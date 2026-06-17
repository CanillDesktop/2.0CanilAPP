export type StatusEstoqueFiltro = 'todos' | 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer';

export type ItensPaginacaoDto = {
  pageNumber?: number;
  pageSize?: number;
};

export type ItemComEstoqueListaResumoDto = {
  totalNoRecorte: number;
  ativos: number;
  baixoEstoque: number;
  semEstoque: number;
  aVencer: number;
};

export type ItemComEstoqueListaPaginadaDto<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  resumo: ItemComEstoqueListaResumoDto;
};
