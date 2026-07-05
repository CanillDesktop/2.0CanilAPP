import { FormularioTransferencia } from '../components/FormularioTransferencia';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';

export function PaginaFormularioTransferencia() {
  return (
    <ShellComSidebar
      titulo="Nova transferência"
      subtitulo="Envie itens da unidade ativa para outra unidade"
      preencherAltura
    >
      <FormularioTransferencia />
    </ShellComSidebar>
  );
}
