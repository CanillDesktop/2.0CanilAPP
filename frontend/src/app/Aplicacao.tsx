import { ProvedorAutenticacao } from './providers/ContextoAutenticacao';
import { ProvedorTemaApp } from './providers/ContextoTemaApp';
import { RotasApp } from './routes/RotasApp';

export function Aplicacao() {
  return (
    <ProvedorTemaApp>
      <ProvedorAutenticacao>
        <RotasApp />
      </ProvedorAutenticacao>
    </ProvedorTemaApp>
  );
}
