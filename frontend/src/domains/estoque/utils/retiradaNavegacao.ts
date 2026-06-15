import type { RetiradaNavegacaoState } from '../types/tiposEstoque';

export type FonteNomeProdutoRetirada = {
  nomeInformado?: string | null;
  nomeComercial?: string | null;
  nomeOuDescricaoSimples?: string | null;
  descricaoSimples?: string | null;
  descricaoDetalhada?: string | null;
};

type DadosRetiradaBase = Omit<RetiradaNavegacaoState, 'produtoNome'> & {
  produto: FonteNomeProdutoRetirada;
};

const CAMPOS_NOME_PRODUTO_RETIRADA: Array<keyof FonteNomeProdutoRetirada> = [
  'nomeInformado',
  'nomeComercial',
  'nomeOuDescricaoSimples',
  'descricaoSimples',
  'descricaoDetalhada',
];

export const MENSAGEM_PRODUTO_SEM_NOME_RETIRADA =
  'Nao foi possivel iniciar a retirada: o item nao possui nome ou descricao cadastrada.';

export function obterProdutoNomeRetirada(produto: FonteNomeProdutoRetirada): string | null {
  for (const campo of CAMPOS_NOME_PRODUTO_RETIRADA) {
    const valor = produto[campo]?.trim();
    if (valor) return valor;
  }

  return null;
}

export function montarRetiradaNavegacaoState(dados: DadosRetiradaBase): RetiradaNavegacaoState | null {
  const produtoNome = obterProdutoNomeRetirada(dados.produto);

  if (!produtoNome) return null;

  return {
    produtoId: dados.produtoId,
    produtoNome,
    codItem: dados.codItem,
    loteId: dados.loteId,
    loteCodigo: dados.loteCodigo,
    quantidadeDisponivel: dados.quantidadeDisponivel,
    retornoRota: dados.retornoRota,
  };
}
