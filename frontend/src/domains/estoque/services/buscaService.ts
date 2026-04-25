import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';

export type BuscaGlobalTipo = 'medicamento' | 'insumo' | 'produto_retirada';

export type BuscaGlobalItem = {
  id: number;
  nome: string;
  tipo: BuscaGlobalTipo;
};

export async function buscarGlobalApi(termo: string): Promise<BuscaGlobalItem[]> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<BuscaGlobalItem[]>('/api/Busca', {
    params: { q: termo },
  });
  return data;
}
