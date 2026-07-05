import type { ItensPaginacaoDto, StatusEstoqueFiltro } from '../types/itemComEstoqueLista';



export const PADRAO_PAGINACAO_ITENS = {
  pageNumber: 1,
  pageSize: 10,
} satisfies Pick<ItensPaginacaoDto, 'pageNumber' | 'pageSize'>;



export function montarParamsPaginacao(paginacao?: ItensPaginacaoDto): Record<string, string | number | undefined> {
  return {
    pageNumber: paginacao?.pageNumber ?? PADRAO_PAGINACAO_ITENS.pageNumber,
    pageSize: paginacao?.pageSize ?? PADRAO_PAGINACAO_ITENS.pageSize,
    orderBy: paginacao?.orderBy,
    sortDirection: paginacao?.sortDirection,
  };
}



export function normalizarStatusEstoqueQuery(status?: StatusEstoqueFiltro): string | undefined {

  return status && status !== 'todos' ? status : undefined;

}

