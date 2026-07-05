import { PERMISSAO } from '../constants/permissoesCodigos';
import type { UsuarioSessao } from '../types/usuarioSessao';

function normalizarCodigos(usuario: UsuarioSessao | null | undefined): Set<string> {
  const codigos = new Set<string>();
  if (!usuario) return codigos;

  for (const codigo of usuario.permissoesCodigos ?? []) {
    if (codigo.trim()) codigos.add(codigo.trim().toLowerCase());
  }

  if ((usuario.permissao ?? 0) === 1) {
    codigos.add(PERMISSAO.sistemaAdministrador);
  }

  return codigos;
}

export function possuiPermissao(
  usuario: UsuarioSessao | null | undefined,
  codigo: string,
): boolean {
  const codigos = normalizarCodigos(usuario);
  if (codigos.has(PERMISSAO.sistemaAdministrador)) return true;
  return codigos.has(codigo.trim().toLowerCase());
}

export function ehAdministradorSistema(usuario: UsuarioSessao | null | undefined): boolean {
  return possuiPermissao(usuario, PERMISSAO.sistemaAdministrador);
}

export function podeGerenciarCatalogoPermissoes(usuario: UsuarioSessao | null | undefined): boolean {
  return possuiPermissao(usuario, PERMISSAO.permissoesCatalogoGerenciar);
}

export function podeVisualizarCatalogoPermissoes(usuario: UsuarioSessao | null | undefined): boolean {
  return (
    possuiPermissao(usuario, PERMISSAO.permissoesCatalogoVisualizar) ||
    podeGerenciarCatalogoPermissoes(usuario)
  );
}

export function podeGerenciarCatalogoUnidadesMedida(usuario: UsuarioSessao | null | undefined): boolean {
  return (
    possuiPermissao(usuario, PERMISSAO.unidadesMedidaGerenciar) ||
    Boolean(usuario?.podeGerenciarUnidadesMedida)
  );
}

export function podeGerenciarAtribuicaoPermissoes(usuario: UsuarioSessao | null | undefined): boolean {
  return (
    possuiPermissao(usuario, PERMISSAO.usuariosGerenciarVinculosUnidade) ||
    podeGerenciarCatalogoPermissoes(usuario)
  );
}
