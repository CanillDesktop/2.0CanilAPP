import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

export function corChipStatus(status: LinhaOperacionalEstoque['status']): 'success' | 'warning' | 'error' {
  if (status === 'ok') return 'success';
  if (status === 'baixo') return 'warning';
  return 'error';
}

export function rotuloStatusEstoque(status: LinhaOperacionalEstoque['status']) {
  if (status === 'ok') return 'OK';
  if (status === 'baixo') return 'Abaixo do mínimo';
  if (status === 'proximo_vencimento') return 'Próximo vencimento';
  return 'Crítico';
}
