/** Papel da aplicação (mapeado do enum numérico do backend). */
export type PapelUsuarioApp = 'ADMIN' | 'LEITURA';

export function mapearPapelUsuario(permissao: number | undefined | null): PapelUsuarioApp {
  return permissao === 1 ? 'ADMIN' : 'LEITURA';
}
