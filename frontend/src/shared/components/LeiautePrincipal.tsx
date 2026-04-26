import { Outlet, useLocation } from 'react-router-dom';

export function LeiautePrincipal() {
  const location = useLocation();
  const ehTelaComLayoutCheio =
    location.pathname.startsWith('/estoque') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/usuarios') ||
    location.pathname.startsWith('/perfil');

  return (
    <div className="app-shell">
      <main className={ehTelaComLayoutCheio ? '' : 'app-conteudo'}>
        <Outlet />
      </main>
    </div>
  );
}
