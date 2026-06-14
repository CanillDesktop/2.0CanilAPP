import type { ItemComEstoqueListaPaginadaDto, ItensPaginacaoDto, StatusEstoqueFiltro } from '../types/itemComEstoqueLista';

export const PADRAO_PAGINACAO_ITENS: Required<ItensPaginacaoDto> = {
  pageNumber: 1,
  pageSize: 10,
};

export const PAGE_SIZE_LEITURA_ESTOQUE = 50;

export function montarParamsPaginacao(paginacao?: ItensPaginacaoDto): Record<string, number> {
  return {
    pageNumber: paginacao?.pageNumber ?? PADRAO_PAGINACAO_ITENS.pageNumber,
    pageSize: paginacao?.pageSize ?? PADRAO_PAGINACAO_ITENS.pageSize,
  };
}

export function normalizarStatusEstoqueQuery(status?: StatusEstoqueFiltro): string | undefined {
  return status && status !== 'todos' ? status : undefined;
}

export async function carregarTodasPaginasLista<T>(
  buscar: (pageNumber: number, pageSize: number) => Promise<ItemComEstoqueListaPaginadaDto<T>>,
  pageSize = PAGE_SIZE_LEITURA_ESTOQUE,
): Promise<T[]> {
  const todos: T[] = [];
  let pageNumber = 1;
  while (true) {
    const resposta = await buscar(pageNumber, pageSize);
    todos.push(...resposta.items);
    if (resposta.items.length < pageSize || pageNumber >= resposta.totalPages) break;
    pageNumber += 1;
  }
  return todos;
}
