export type TipoItemUnidadeMedida = 'produto' | 'medicamento' | 'insumo';

export type UnidadeMedidaDto = {
  id: number;
  nome: string;
  sigla?: string | null;
  aplicavelProduto: boolean;
  aplicavelMedicamento: boolean;
  aplicavelInsumo: boolean;
  ativa: boolean;
};

export type UnidadeMedidaCadastroDto = {
  nome: string;
  sigla?: string | null;
  aplicavelProduto: boolean;
  aplicavelMedicamento: boolean;
  aplicavelInsumo: boolean;
  ativa: boolean;
};

export function rotuloUnidadeMedida(u: Pick<UnidadeMedidaDto, 'nome' | 'sigla'>): string {
  return u.sigla ? `${u.nome} (${u.sigla})` : u.nome;
}
