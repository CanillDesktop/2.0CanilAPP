import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';

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
          {usuario.nome} {usuario.sobrenome}
        </dd>
        <dt>E-mail</dt>
        <dd>{usuario.email}</dd>
        <dt>Permissão</dt>
        <dd>{usuario.permissao === 1 ? 'Administrador' : 'Leitura'}</dd>
      </dl>
    </section>
  );
}
