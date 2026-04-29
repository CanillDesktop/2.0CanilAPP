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

type Props = {
  usuarios: UsuarioCriadoDto[];
  carregando?: boolean;
  onEditar: (usuario: UsuarioCriadoDto) => void;
  onInativar: (usuario: UsuarioCriadoDto) => void;
  onRemover: (usuario: UsuarioCriadoDto) => void;
};

function rotuloPermissao(permissao: number) {
  return permissao === 1 ? 'Administrador' : 'Leitura';
}

export function ListagemUsuariosResponsiva({
  usuarios,
  carregando = false,
  onEditar,
  onInativar,
  onRemover,
}: Props) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

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
                  <Chip label={usuario.isDeleted ? 'Inativo' : 'Ativo'} color={usuario.isDeleted ? 'default' : 'success'} size="small" />
                  <Chip label={rotuloPermissao(usuario.permissao)} size="small" />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Button size="small" onClick={() => onEditar(usuario)} disabled={carregando}>
                    Editar
                  </Button>
                  <Button size="small" color="warning" onClick={() => onInativar(usuario)} disabled={carregando || usuario.isDeleted}>
                    Inativar
                  </Button>
                  <Button size="small" color="error" onClick={() => onRemover(usuario)} disabled={carregando}>
                    Remover
                  </Button>
                </Stack>
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
            <TableCell>{usuario.primeiroNome} {usuario.sobrenome ?? ''}</TableCell>
            <TableCell>{usuario.email}</TableCell>
            <TableCell>
              <Chip label={usuario.isDeleted ? 'Inativo' : 'Ativo'} color={usuario.isDeleted ? 'default' : 'success'} size="small" />
            </TableCell>
            <TableCell>{rotuloPermissao(usuario.permissao)}</TableCell>
            <TableCell align="right">
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => onEditar(usuario)} disabled={carregando}>
                  Editar
                </Button>
                <Button size="small" color="warning" onClick={() => onInativar(usuario)} disabled={carregando || usuario.isDeleted}>
                  Inativar
                </Button>
                <Button size="small" color="error" onClick={() => onRemover(usuario)} disabled={carregando}>
                  Remover
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
