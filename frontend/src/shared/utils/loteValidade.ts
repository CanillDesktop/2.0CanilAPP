export function obterStatusValidade(validadeIso: string): {
  label: string;
  color: 'success' | 'warning' | 'error';
} {
  const validade = new Date(validadeIso);
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() + 30);

  if (validade < hoje) return { label: 'Vencido', color: 'error' };
  if (validade <= limite) return { label: 'A vencer', color: 'error' };
  return { label: 'Válido', color: 'success' };
}
