import type { UsuarioUnidadeEstoqueAtribuicaoDto } from '../../usuarios/types/tiposUsuarios';

export const UnidadeEstoqueIds = {
  Secretaria: 1,
  Canil: 2,
} as const;

export type EscolhaUnidadeCadastro = 'secretaria' | 'canil';

export const ROTULOS_UNIDADE_CADASTRO: Record<EscolhaUnidadeCadastro, string> = {
  secretaria: 'Secretaria',
  canil: 'Canil',
};

export function montarUnidadesEstoqueCadastro(
  escolha: EscolhaUnidadeCadastro,
): UsuarioUnidadeEstoqueAtribuicaoDto[] {
  if (escolha === 'canil') {
    return [
      {
        idUnidadeEstoque: UnidadeEstoqueIds.Canil,
        podeConsultar: true,
        podeEntrada: true,
        podeSaida: true,
        podeTransferirEnviar: false,
        podeTransferirReceber: true,
      },
    ];
  }

  return [
    {
      idUnidadeEstoque: UnidadeEstoqueIds.Secretaria,
      podeConsultar: true,
      podeEntrada: true,
      podeSaida: true,
      podeTransferirEnviar: true,
      podeTransferirReceber: false,
    },
  ];
}

export const HEADER_UNIDADE_ESTOQUE = 'X-Unidade-Estoque-Id';
