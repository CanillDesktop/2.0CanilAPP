import type { UsuarioSessao } from '../../../shared/types/usuarioSessao';
import { podeGerenciarCatalogoUnidadesMedida as podeGerenciarMedidas } from '../../../shared/utils/possuiPermissao';

export function formatarTempoCadastro(dataHoraCriacao?: Date) {
  if (!dataHoraCriacao) return 'Não informado';
  const inicio = new Date(dataHoraCriacao);
  if (Number.isNaN(inicio.getTime())) return 'Não informado';

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

/** Admin ou usuário com permissão de catálogo de unidades de medida. */
export function podeGerenciarCatalogoUnidadesMedida(usuario?: {
  permissao?: number;
  podeGerenciarUnidadesMedida?: boolean;
  permissoesCodigos?: string[];
} | null): boolean {
  return podeGerenciarMedidas(usuario as UsuarioSessao | null);
}

const ROTULOS_PERMISSAO_UNIDADE = [
  { chave: 'podeConsultar', rotulo: 'Consultar' },
  { chave: 'podeEntrada', rotulo: 'Entrada' },
  { chave: 'podeSaida', rotulo: 'Saída' },
  { chave: 'podeTransferirEnviar', rotulo: 'Enviar transferência' },
  { chave: 'podeTransferirReceber', rotulo: 'Receber transferência' },
] as const;

export function listarRotulosPermissoesUnidade(vinculo: {
  podeConsultar: boolean;
  podeEntrada: boolean;
  podeSaida: boolean;
  podeTransferirEnviar: boolean;
  podeTransferirReceber: boolean;
}): string[] {
  return ROTULOS_PERMISSAO_UNIDADE.filter((item) => vinculo[item.chave]).map((item) => item.rotulo);
}
