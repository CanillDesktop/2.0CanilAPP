export function formatarTempoCadastro(dataHoraCriacao?: Date) {
  if (!dataHoraCriacao) return 'Nao informado';
  const inicio = new Date(dataHoraCriacao);
  if (Number.isNaN(inicio.getTime())) return 'Nao informado';

  const agora = new Date();
  const diffMs = agora.getTime() - inicio.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (dias <= 0) return 'Menos de 1 dia';
  if (dias === 1) return '1 dia';
  if (dias < 30) return `${dias} dias`;
  const meses = Math.floor(dias / 30);
  if (meses === 1) return '1 mes';
  if (meses < 12) return `${meses} meses`;
  const anos = Math.floor(meses / 12);
  return anos === 1 ? '1 ano' : `${anos} anos`;
}

export function descreverPermissao(permissao: number) {
  if (permissao === 1) return 'Administrador';
  if (permissao === 2) return 'Leitura';
  return `Nivel ${permissao}`;
}
