import { Outlet, useLocation } from 'react-router-dom';

export function LeiautePrincipal() {
  const location = useLocation();
  const ehTelaEstoque = location.pathname.startsWith('/estoque');

  return (
    <div className="app-shell">
      <main className={ehTelaEstoque ? '' : 'app-conteudo'}>
        <Outlet />
      </main>
    </div>
  );
}
