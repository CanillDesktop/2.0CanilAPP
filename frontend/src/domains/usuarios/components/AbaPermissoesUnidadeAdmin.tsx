import { useNavigate } from 'react-router-dom';
import { ListagemUsuariosAdminConteudo } from './ListagemUsuariosAdminConteudo';
import type { ListagemUsuariosAdminConteudoProps } from './ListagemUsuariosAdminConteudo';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';

type Props = Omit<
  Extract<ListagemUsuariosAdminConteudoProps, { modo: 'permissoes' }>,
  'modo' | 'onAbrirPermissoes' | 'titulo' | 'descricao'
>;

export function AbaPermissoesUnidadeAdmin(props: Props) {
  const navigate = useNavigate();

  function abrirPermissoes(usuario: UsuarioCriadoDto) {
    if (!usuario.id) return;
    navigate(`/usuarios/permissoes?usuarioId=${usuario.id}`);
  }

  return (
    <ListagemUsuariosAdminConteudo
      {...props}
      modo="permissoes"
      titulo="Permissões por unidade"
      descricao="Selecione um usuário para definir vínculos de estoque ou atribuir permissões completas (aba Permissões completas)."
      onAbrirPermissoes={abrirPermissoes}
    />
  );
}
