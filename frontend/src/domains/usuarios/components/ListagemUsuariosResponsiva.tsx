import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';
import { rotuloStatusUsuario, StatusUsuario } from '../types/tiposUsuarios';

type Props = {
  usuarios: UsuarioCriadoDto[];
  usuarioLogadoId?: number | null;
  carregando?: boolean;
  modoPermissoes?: boolean;
  onAbrirPermissoes?: (usuario: UsuarioCriadoDto) => void;
  onEditar: (usuario: UsuarioCriadoDto) => void;
  onInativar: (usuario: UsuarioCriadoDto) => void;
  onReativar: (usuario: UsuarioCriadoDto) => void;
  onRemover: (usuario: UsuarioCriadoDto) => void;
  onRemoverDefinitivo: (usuario: UsuarioCriadoDto) => void;
};

function rotuloPermissao(permissao: number) {
  return permissao === 1 ? 'Administrador' : 'Leitura';
}

function corStatus(status: number): 'success' | 'default' | 'error' {
  if (status === StatusUsuario.Ativo) return 'success';
  if (status === StatusUsuario.Inativo) return 'default';
  return 'error';
}

function AcoesUsuario({
  usuario,
  usuarioLogadoId,
  carregando,
  onEditar,
  onInativar,
  onReativar,
  onRemover,
  onRemoverDefinitivo,
}: Props & { usuario: UsuarioCriadoDto }) {
  const ehProprioUsuario = usuarioLogadoId != null && usuario.id === usuarioLogadoId;
  const bloqueioAuto = carregando || ehProprioUsuario;

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <Button size="small" onClick={() => onEditar(usuario)} disabled={carregando}>
        Editar
      </Button>

      {usuario.status === StatusUsuario.Ativo ? (
        <>
          <Button size="small" color="warning" onClick={() => onInativar(usuario)} disabled={bloqueioAuto}>
            Inativar
          </Button>
          <Button size="small" color="error" onClick={() => onRemover(usuario)} disabled={bloqueioAuto}>
            Excluir
          </Button>
        </>
      ) : null}

      {usuario.status === StatusUsuario.Inativo ? (
        <>
          <Button size="small" color="success" onClick={() => onReativar(usuario)} disabled={carregando}>
            Reativar
          </Button>
          <Button size="small" color="error" onClick={() => onRemover(usuario)} disabled={bloqueioAuto}>
            Excluir
          </Button>
        </>
      ) : null}

      {usuario.status === StatusUsuario.Excluido ? (
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={() => onRemoverDefinitivo(usuario)}
          disabled={carregando}
        >
          Remover definitivamente
        </Button>
      ) : null}
    </Stack>
  );
}

export function ListagemUsuariosResponsiva({
  usuarios,
  usuarioLogadoId,
  carregando = false,
  modoPermissoes = false,
  onAbrirPermissoes,
  onEditar,
  onInativar,
  onReativar,
  onRemover,
  onRemoverDefinitivo,
}: Props) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  function abrirPermissoes(usuario: UsuarioCriadoDto) {
    onAbrirPermissoes?.(usuario);
  }

  if (modoPermissoes) {
    if (mobile) {
      return (
        <Stack spacing={1.5}>
          {usuarios.map((usuario) => (
            <Card
              key={usuario.id}
              sx={{ cursor: 'pointer' }}
              onClick={() => abrirPermissoes(usuario)}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {usuario.primeiroNome} {usuario.sobrenome ?? ''}
                  </Typography>
                  <Typography variant="body2">{usuario.email}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={rotuloStatusUsuario(usuario.status)}
                      color={corStatus(usuario.status)}
                      size="small"
                    />
                    <Chip label={rotuloPermissao(usuario.permissao)} size="small" />
                  </Stack>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AdminPanelSettingsOutlinedIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirPermissoes(usuario);
                    }}
                  >
                    Definir permissões
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      );
    }

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome completo</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Permissão</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow
              key={usuario.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => abrirPermissoes(usuario)}
            >
              <TableCell>
                {usuario.primeiroNome} {usuario.sobrenome ?? ''}
              </TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell>
                <Chip
                  label={rotuloStatusUsuario(usuario.status)}
                  color={corStatus(usuario.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{rotuloPermissao(usuario.permissao)}</TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AdminPanelSettingsOutlinedIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirPermissoes(usuario);
                  }}
                >
                  Permissões
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (mobile) {
    return (
      <Stack spacing={1.5}>
        {usuarios.map((usuario) => (
          <Card key={usuario.id}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {usuario.primeiroNome} {usuario.sobrenome ?? ''}
                </Typography>
                <Typography variant="body2">{usuario.email}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={rotuloStatusUsuario(usuario.status)}
                    color={corStatus(usuario.status)}
                    size="small"
                  />
                  <Chip label={rotuloPermissao(usuario.permissao)} size="small" />
                </Stack>
                <AcoesUsuario
                  usuario={usuario}
                  usuarios={usuarios}
                  usuarioLogadoId={usuarioLogadoId}
                  carregando={carregando}
                  onEditar={onEditar}
                  onInativar={onInativar}
                  onReativar={onReativar}
                  onRemover={onRemover}
                  onRemoverDefinitivo={onRemoverDefinitivo}
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Nome completo</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Permissão</TableCell>
          <TableCell align="right">Ações</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {usuarios.map((usuario) => (
          <TableRow key={usuario.id}>
            <TableCell>
              {usuario.primeiroNome} {usuario.sobrenome ?? ''}
            </TableCell>
            <TableCell>{usuario.email}</TableCell>
            <TableCell>
              <Chip
                label={rotuloStatusUsuario(usuario.status)}
                color={corStatus(usuario.status)}
                size="small"
              />
            </TableCell>
            <TableCell>{rotuloPermissao(usuario.permissao)}</TableCell>
            <TableCell align="right">
              <AcoesUsuario
                usuario={usuario}
                usuarios={usuarios}
                usuarioLogadoId={usuarioLogadoId}
                carregando={carregando}
                onEditar={onEditar}
                onInativar={onInativar}
                onReativar={onReativar}
                onRemover={onRemover}
                onRemoverDefinitivo={onRemoverDefinitivo}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
