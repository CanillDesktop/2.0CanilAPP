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
      descricao="Selecione um usuário para definir consulta, entradas, saídas e transferências na Secretaria e no Canil."
      onAbrirPermissoes={abrirPermissoes}
    />
  );
}
