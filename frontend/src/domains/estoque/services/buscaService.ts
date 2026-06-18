import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';

export type BuscaGlobalTipo = 'medicamento' | 'insumo' | 'produto_retirada';

/** Formato retornado pela API (/api/Busca → BuscaItemDTO). */
type BuscaItemRespostaApi = {
  id: number;
  nomeOuDescricaoSimples: string;
  tipo: BuscaGlobalTipo;
};

export type BuscaGlobalItem = {
  id: number;
  nome: string;
  tipo: BuscaGlobalTipo;
};

export async function buscarGlobalApi(termo: string): Promise<BuscaGlobalItem[]> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<BuscaItemRespostaApi[]>('/api/Busca', {
    params: { q: termo },
  });
  return data.map((item) => ({
    id: item.id,
    nome: item.nomeOuDescricaoSimples,
    tipo: item.tipo,
  }));
}
