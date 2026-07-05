/** Papel da aplicação (mapeado do id de cargo do backend). */
export type PapelUsuarioApp = 'ADMIN' | 'GRUPO_PADRAO';

/** @deprecated use GRUPO_PADRAO */
export type PapelUsuarioAppLegado = PapelUsuarioApp | 'LEITURA';

export function mapearPapelUsuario(permissao: number | undefined | null): PapelUsuarioApp {
  return permissao === 1 ? 'ADMIN' : 'GRUPO_PADRAO';
}
