import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import {
  Box,
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
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';
import { rotuloStatusUsuario, StatusUsuario } from '../types/tiposUsuarios';

type Props = {
  usuarios: UsuarioCriadoDto[];
  usuarioLogadoId?: number | null;
  carregando?: boolean;
  modoPermissoes?: boolean;
  onAbrirPermissoes?: (usuario: UsuarioCriadoDto) => void;
  onEditar: (usuario: UsuarioCriadoDto) => void;
  onRedefinirSenha?: (usuario: UsuarioCriadoDto) => void;
  onInativar: (usuario: UsuarioCriadoDto) => void;
  onReativar: (usuario: UsuarioCriadoDto) => void;
  onRemover: (usuario: UsuarioCriadoDto) => void;
  onRemoverDefinitivo: (usuario: UsuarioCriadoDto) => void;
};

import { descreverCargo } from '../utils/exibirPerfilUsuario';

function rotuloCargo(usuario: { nomeCargo?: string; idCargo?: number }) {
  return descreverCargo(usuario);
}

function corStatus(status: number): 'success' | 'default' | 'error' {
  if (status === StatusUsuario.Ativo) return 'success';
  if (status === StatusUsuario.Inativo) return 'default';
  return 'error';
}

function nomeCompleto(usuario: UsuarioCriadoDto) {
  return `${usuario.primeiroNome} ${usuario.sobrenome ?? ''}`.trim();
}

function AcoesUsuario({
  usuario,
  usuarioLogadoId,
  carregando,
  compacto,
  onEditar,
  onRedefinirSenha,
  onInativar,
  onReativar,
  onRemover,
  onRemoverDefinitivo,
}: {
  usuario: UsuarioCriadoDto;
  usuarioLogadoId?: number | null;
  carregando?: boolean;
  compacto?: boolean;
  onEditar: (usuario: UsuarioCriadoDto) => void;
  onRedefinirSenha?: (usuario: UsuarioCriadoDto) => void;
  onInativar: (usuario: UsuarioCriadoDto) => void;
  onReativar: (usuario: UsuarioCriadoDto) => void;
  onRemover: (usuario: UsuarioCriadoDto) => void;
  onRemoverDefinitivo: (usuario: UsuarioCriadoDto) => void;
}) {
  const ehProprioUsuario = usuarioLogadoId != null && usuario.id === usuarioLogadoId;
  const bloqueioAuto = carregando || ehProprioUsuario;
  const sxBotao = compacto
    ? {
        flex: '1 1 calc(50% - 4px)',
        minWidth: 0,
        minHeight: 40,
        textTransform: 'none' as const,
        fontWeight: 600,
        fontSize: '0.8rem',
        borderRadius: 2,
      }
    : undefined;

  return (
    <Stack
      direction="row"
      sx={{
        flexWrap: 'wrap',
        justifyContent: compacto ? 'stretch' : 'flex-end',
        gap: compacto ? 0.75 : 1,
      }}
    >
      <Button size="small" onClick={() => onEditar(usuario)} disabled={carregando} sx={sxBotao}>
        Editar
      </Button>

      {onRedefinirSenha && !ehProprioUsuario ? (
        <Button
          size="small"
          color="secondary"
          onClick={() => onRedefinirSenha(usuario)}
          disabled={carregando}
          sx={sxBotao}
        >
          Senha
        </Button>
      ) : null}

      {usuario.status === StatusUsuario.Ativo ? (
        <>
          <Button
            size="small"
            color="warning"
            onClick={() => onInativar(usuario)}
            disabled={bloqueioAuto}
            sx={sxBotao}
          >
            Inativar
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onRemover(usuario)}
            disabled={bloqueioAuto}
            sx={sxBotao}
          >
            Excluir
          </Button>
        </>
      ) : null}

      {usuario.status === StatusUsuario.Inativo ? (
        <>
          <Button
            size="small"
            color="success"
            onClick={() => onReativar(usuario)}
            disabled={carregando}
            sx={sxBotao}
          >
            Reativar
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onRemover(usuario)}
            disabled={bloqueioAuto}
            sx={sxBotao}
          >
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
          sx={compacto ? { ...sxBotao, flex: '1 1 100%' } : undefined}
        >
          Remover definitivamente
        </Button>
      ) : null}
    </Stack>
  );
}

function CardUsuarioMobile({
  usuario,
  modoPermissoes,
  usuarioLogadoId,
  carregando,
  onAbrirPermissoes,
  onEditar,
  onRedefinirSenha,
  onInativar,
  onReativar,
  onRemover,
  onRemoverDefinitivo,
}: {
  usuario: UsuarioCriadoDto;
  modoPermissoes: boolean;
  usuarioLogadoId?: number | null;
  carregando?: boolean;
  onAbrirPermissoes?: (usuario: UsuarioCriadoDto) => void;
  onEditar: (usuario: UsuarioCriadoDto) => void;
  onRedefinirSenha?: (usuario: UsuarioCriadoDto) => void;
  onInativar: (usuario: UsuarioCriadoDto) => void;
  onReativar: (usuario: UsuarioCriadoDto) => void;
  onRemover: (usuario: UsuarioCriadoDto) => void;
  onRemoverDefinitivo: (usuario: UsuarioCriadoDto) => void;
}) {
  const { cores } = useTemaApp();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${cores.border}`,
        bgcolor: cores.bgCard,
        ...(modoPermissoes ? { cursor: 'pointer' } : {}),
      }}
      onClick={modoPermissoes ? () => onAbrirPermissoes?.(usuario) : undefined}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1.25}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  lineHeight: 1.3,
                  color: cores.textPrimary,
                }}
              >
                {nomeCompleto(usuario)}
              </Typography>
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: '0.78rem',
                  lineHeight: 1.35,
                  color: cores.textMuted,
                  wordBreak: 'break-word',
                }}
              >
                {usuario.email}
              </Typography>
            </Box>
            <Chip
              label={rotuloStatusUsuario(usuario.status)}
              color={corStatus(usuario.status)}
              size="small"
              sx={{ height: 24, fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}
            />
          </Stack>

          <Chip
            label={rotuloCargo(usuario)}
            size="small"
            sx={{
              alignSelf: 'flex-start',
              height: 24,
              fontWeight: 600,
              fontSize: '0.7rem',
              bgcolor: cores.chipBg,
              border: `1px solid ${cores.chipBorder}`,
              color: cores.textPrimary,
            }}
          />

          {modoPermissoes ? (
            <Button
              size="small"
              variant="contained"
              fullWidth
              startIcon={<AdminPanelSettingsOutlinedIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onAbrirPermissoes?.(usuario);
              }}
              sx={{
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                borderRadius: 2,
              }}
            >
              Definir permissões
            </Button>
          ) : (
            <Box sx={{ pt: 0.25 }}>
              <AcoesUsuario
                usuario={usuario}
                usuarioLogadoId={usuarioLogadoId}
                carregando={carregando}
                compacto
                onEditar={onEditar}
                onRedefinirSenha={onRedefinirSenha}
                onInativar={onInativar}
                onReativar={onReativar}
                onRemover={onRemover}
                onRemoverDefinitivo={onRemoverDefinitivo}
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ListagemUsuariosResponsiva({
  usuarios,
  usuarioLogadoId,
  carregando = false,
  modoPermissoes = false,
  onAbrirPermissoes,
  onEditar,
  onRedefinirSenha,
  onInativar,
  onReativar,
  onRemover,
  onRemoverDefinitivo,
}: Props) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  if (mobile) {
    return (
      <Stack spacing={1.25}>
        {usuarios.map((usuario) => (
          <CardUsuarioMobile
            key={usuario.id}
            usuario={usuario}
            modoPermissoes={modoPermissoes}
            usuarioLogadoId={usuarioLogadoId}
            carregando={carregando}
            onAbrirPermissoes={onAbrirPermissoes}
            onEditar={onEditar}
            onRedefinirSenha={onRedefinirSenha}
            onInativar={onInativar}
            onReativar={onReativar}
            onRemover={onRemover}
            onRemoverDefinitivo={onRemoverDefinitivo}
          />
        ))}
      </Stack>
    );
  }

  if (modoPermissoes) {
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
              onClick={() => onAbrirPermissoes?.(usuario)}
            >
              <TableCell>{nomeCompleto(usuario)}</TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell>
                <Chip
                  label={rotuloStatusUsuario(usuario.status)}
                  color={corStatus(usuario.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{rotuloCargo(usuario)}</TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AdminPanelSettingsOutlinedIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAbrirPermissoes?.(usuario);
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
            <TableCell>{nomeCompleto(usuario)}</TableCell>
            <TableCell>{usuario.email}</TableCell>
            <TableCell>
              <Chip
                label={rotuloStatusUsuario(usuario.status)}
                color={corStatus(usuario.status)}
                size="small"
              />
            </TableCell>
            <TableCell>{rotuloCargo(usuario)}</TableCell>
            <TableCell align="right">
              <AcoesUsuario
                usuario={usuario}
                usuarioLogadoId={usuarioLogadoId}
                carregando={carregando}
                onEditar={onEditar}
                onRedefinirSenha={onRedefinirSenha}
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
