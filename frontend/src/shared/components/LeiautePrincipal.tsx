import { Outlet, useLocation } from 'react-router-dom';

export function LeiautePrincipal() {
  const location = useLocation();
  const semContainer =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/codigo-acesso') ||
    location.pathname.startsWith('/cadastro');

  return (
    <div className="app-shell">
      <main className={semContainer ? '' : 'app-conteudo'}>
        <Outlet />
      </main>
    </div>
  );
}
