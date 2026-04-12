import { ProvedorAutenticacao } from './providers/ContextoAutenticacao';
import { RotasApp } from './routes/RotasApp';

export function Aplicacao() {
  return (
    <ProvedorAutenticacao>
      <RotasApp />
    </ProvedorAutenticacao>
  );
}
