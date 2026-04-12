/**
 * Componente puramente apresentacional do domínio de sincronização.
 */
export function SecaoInformativa() {
  return (
    <aside className="secao-informativa">
      <p>
        Estes endpoints são mantidos para compatibilidade com o aplicativo legado e não executam
        sincronização com serviços externos.
      </p>
    </aside>
  );
}
