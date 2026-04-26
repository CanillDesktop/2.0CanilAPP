import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

export function rotuloTipoItem(origem: LinhaOperacionalEstoque['origem']) {
  if (origem === 'produto') return 'Produto';
  if (origem === 'medicamento') return 'Medicamento';
  return 'Insumo';
}
