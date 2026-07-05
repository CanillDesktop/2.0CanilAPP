import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { descreverCargo } from '../../usuarios/utils/exibirPerfilUsuario';

export function PaginaDetalheSessao() {
  const { usuario } = useAutenticacao();

  if (!usuario) {
    return <p>Nenhuma sessão ativa.</p>;
  }

  return (
    <section>
      <h1>Sessão</h1>
      <dl className="lista-detalhe">
        <dt>Nome</dt>
        <dd>
          {usuario.primeiroNome} {usuario.sobrenome}
        </dd>
        <dt>E-mail</dt>
        <dd>{usuario.email}</dd>
        <dt>Cargo</dt>
        <dd>{descreverCargo(usuario)}</dd>
      </dl>
    </section>
  );
}
