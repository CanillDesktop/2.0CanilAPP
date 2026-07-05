import type { UnidadeMedidaDto } from '../types/tiposUnidadeMedida';
import { rotuloUnidadeMedida } from '../types/tiposUnidadeMedida';

export type CampoOrdenacaoUnidadeMedida = 'nome' | 'tipos' | 'situacao';

export type DirecaoOrdenacao = 'asc' | 'desc';

function aplicarDirecao(valor: number, direction: DirecaoOrdenacao): number {
  return direction === 'asc' ? valor : -valor;
}

function rotuloTiposAplicaveis(item: UnidadeMedidaDto): string {
  const tipos: string[] = [];
  if (item.aplicavelProduto) tipos.push('Produtos');
  if (item.aplicavelMedicamento) tipos.push('Medicamentos');
  if (item.aplicavelInsumo) tipos.push('Insumos');
  return tipos.join(', ');
}

export function ordenarUnidadesMedida(
  itens: UnidadeMedidaDto[],
  orderBy: CampoOrdenacaoUnidadeMedida,
  direction: DirecaoOrdenacao,
): UnidadeMedidaDto[] {
  return [...itens].sort((a, b) => {
    switch (orderBy) {
      case 'nome':
        return aplicarDirecao(
          rotuloUnidadeMedida(a).localeCompare(rotuloUnidadeMedida(b), 'pt-BR', {
            numeric: true,
            sensitivity: 'base',
          }),
          direction,
        );
      case 'tipos': {
        const diffTipos = rotuloTiposAplicaveis(a).localeCompare(rotuloTiposAplicaveis(b), 'pt-BR', {
          sensitivity: 'base',
        });
        if (diffTipos !== 0) return aplicarDirecao(diffTipos, direction);
        return aplicarDirecao(
          rotuloUnidadeMedida(a).localeCompare(rotuloUnidadeMedida(b), 'pt-BR', {
            numeric: true,
            sensitivity: 'base',
          }),
          direction,
        );
      }
      case 'situacao': {
        const diff = Number(a.ativa) - Number(b.ativa);
        if (diff !== 0) return aplicarDirecao(diff, direction);
        return aplicarDirecao(
          rotuloUnidadeMedida(a).localeCompare(rotuloUnidadeMedida(b), 'pt-BR', {
            numeric: true,
            sensitivity: 'base',
          }),
          direction,
        );
      }
      default:
        return 0;
    }
  });
}
