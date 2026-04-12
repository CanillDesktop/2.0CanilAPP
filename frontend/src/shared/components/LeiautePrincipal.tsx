import { Link, Outlet } from 'react-router-dom';
import { useAutenticacao } from '../../app/providers/ContextoAutenticacao';

const links: { para: string; texto: string }[] = [
  { para: '/', texto: 'Início' },
  { para: '/sessao', texto: 'Sessão' },
  { para: '/usuarios', texto: 'Usuários' },
  { para: '/produtos', texto: 'Produtos' },
  { para: '/medicamentos', texto: 'Medicamentos' },
  { para: '/insumos', texto: 'Insumos' },
  { para: '/estoque', texto: 'Estoque' },
  { para: '/sincronizacao', texto: 'Sincronização' },
];

export function LeiautePrincipal() {
  const { autenticado, sair } = useAutenticacao();

  return (
    <div className="app-shell">
      <header className="app-cabecalho">
        <strong className="app-marca">CanilApp</strong>
        <nav className="app-nav">
          {autenticado &&
            links.map((l) => (
              <Link key={l.para} to={l.para}>
                {l.texto}
              </Link>
            ))}
        </nav>
        <div className="app-acoes">
          {autenticado ? (
            <button type="button" onClick={sair}>
              Sair
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="app-conteudo">
        <Outlet />
      </main>
    </div>
  );
}
