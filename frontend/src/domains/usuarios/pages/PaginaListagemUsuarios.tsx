import { Link } from 'react-router-dom';

/**
 * A API atual expõe apenas criação de usuários (`POST /api/Usuarios`).
 * Esta página documenta o fluxo e encaminha para o cadastro.
 */
export function PaginaListagemUsuarios() {
  return (
    <section>
      <h1>Usuários</h1>
      <p>
        Não há endpoint público de listagem de usuários nesta versão do backend. Utilize o cadastro para
        criar novos acessos ou consulte o painel de sessão para ver o usuário autenticado.
      </p>
      <p>
        <Link className="link-acao" to="/usuarios/novo">
          Ir para cadastro de usuário
        </Link>
      </p>
    </section>
  );
}
