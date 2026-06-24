import { FormularioNovoLote } from '../components/FormularioNovoLote';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';

export function PaginaFormularioEntrada() {
  return (
    <ShellComSidebar titulo="Entrada de estoque" subtitulo="Registre compra ou doação na unidade selecionada">
      <FormularioNovoLote />
    </ShellComSidebar>
  );
}
