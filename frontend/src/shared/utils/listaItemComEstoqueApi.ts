import type { ItensPaginacaoDto, StatusEstoqueFiltro } from '../types/itemComEstoqueLista';



export const PADRAO_PAGINACAO_ITENS: Required<ItensPaginacaoDto> = {

  pageNumber: 1,

  pageSize: 10,

};



export function montarParamsPaginacao(paginacao?: ItensPaginacaoDto): Record<string, number> {

  return {

    pageNumber: paginacao?.pageNumber ?? PADRAO_PAGINACAO_ITENS.pageNumber,

    pageSize: paginacao?.pageSize ?? PADRAO_PAGINACAO_ITENS.pageSize,

  };

}



export function normalizarStatusEstoqueQuery(status?: StatusEstoqueFiltro): string | undefined {

  return status && status !== 'todos' ? status : undefined;

}

