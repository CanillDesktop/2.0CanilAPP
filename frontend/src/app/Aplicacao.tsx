import { ProvedorAutenticacao } from './providers/ContextoAutenticacao';
import { ProvedorTemaApp } from './providers/ContextoTemaApp';
import { ProvedorUnidadeEstoque } from './providers/ContextoUnidadeEstoque';
import { RotasApp } from './routes/RotasApp';

export function Aplicacao() {
  return (
    <ProvedorTemaApp>
      <ProvedorAutenticacao>
        <ProvedorUnidadeEstoque>
          <RotasApp />
        </ProvedorUnidadeEstoque>
      </ProvedorAutenticacao>
    </ProvedorTemaApp>
  );
}
