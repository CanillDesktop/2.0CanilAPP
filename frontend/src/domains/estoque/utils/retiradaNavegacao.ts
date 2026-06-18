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

export const MENSAGEM_LOTE_INVALIDO_RETIRADA =
  'Nao foi possivel iniciar a retirada: o lote selecionado e invalido.';

/**
 * Serializa o contexto de retirada na URL para que o formulário sobreviva a um F5
 * ou acesso direto à URL (não depende apenas de location.state).
 */
export function montarRetiradaQueryString(state: RetiradaNavegacaoState): string {
  const params = new URLSearchParams();
  params.set('produtoId', String(state.produtoId));
  params.set('produtoNome', state.produtoNome);
  params.set('codItem', state.codItem);
  params.set('loteId', state.loteId);
  params.set('loteCodigo', state.loteCodigo);
  params.set('quantidadeDisponivel', String(state.quantidadeDisponivel));
  if (state.retornoRota) params.set('retornoRota', state.retornoRota);
  return params.toString();
}

/**
 * Reconstrói o contexto de retirada a partir dos parâmetros da URL.
 * Retorna null quando faltam os identificadores mínimos (código + lote).
 */
export function lerRetiradaNavegacaoDeQuery(params: URLSearchParams): RetiradaNavegacaoState | null {
  const codItem = params.get('codItem')?.trim();
  const loteCodigo = params.get('loteCodigo')?.trim();
  const produtoNome = params.get('produtoNome')?.trim();

  if (!codItem || !loteCodigo || !produtoNome) return null;

  const produtoId = Number(params.get('produtoId'));
  const quantidadeDisponivel = Number(params.get('quantidadeDisponivel'));

  return {
    produtoId: Number.isFinite(produtoId) ? produtoId : 0,
    produtoNome,
    codItem,
    loteId: params.get('loteId')?.trim() || `${produtoId}-${loteCodigo}`,
    loteCodigo,
    quantidadeDisponivel: Number.isFinite(quantidadeDisponivel) ? quantidadeDisponivel : 0,
    retornoRota: params.get('retornoRota')?.trim() || undefined,
  };
}

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
