import { Outlet, useLocation } from 'react-router-dom';

export function LeiautePrincipal() {
  const location = useLocation();
  const ehLogin = location.pathname.startsWith('/login');

  return (
    <div className="app-shell">
      <main className={ehLogin ? '' : 'app-conteudo'}>
        <Outlet />
      </main>
    </div>
  );
}
