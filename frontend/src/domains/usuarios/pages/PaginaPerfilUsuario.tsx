import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { FormularioUsuario } from '../components/FormularioUsuario';
import { useUsuarios } from '../hooks/useUsuarios';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';

function formatarTempoCadastro(dataHoraCriacao?: Date) {
  if (!dataHoraCriacao) return 'Nao informado';
  const inicio = new Date(dataHoraCriacao);
  if (Number.isNaN(inicio.getTime())) return 'Nao informado';

  const agora = new Date();
  const diffMs = agora.getTime() - inicio.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (dias <= 0) return 'Menos de 1 dia';
  if (dias === 1) return '1 dia';
  if (dias < 30) return `${dias} dias`;
  const meses = Math.floor(dias / 30);
  if (meses === 1) return '1 mes';
  if (meses < 12) return `${meses} meses`;
  const anos = Math.floor(meses / 12);
  return anos === 1 ? '1 ano' : `${anos} anos`;
}

function descreverPermissao(permissao: number) {
  if (permissao === 1) return 'Administrador';
  if (permissao === 2) return 'Leitura';
  return `Nivel ${permissao}`;
}

export function PaginaPerfilUsuario() {
  const { usuario, recarregarSessao } = useAutenticacao();
  const { usuarioAtual, carregandoAcao, erro, sucesso, limparFeedback, atualizarUsuario } = useUsuarios(usuario, false);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [alvoEdicao, setAlvoEdicao] = useState<UsuarioCriadoDto | null>(null);

  async function salvarEdicao(dados: { primeiroNome: string; sobrenome?: string | null }) {
    if (!alvoEdicao?.id) return;
    const atualizado = await atualizarUsuario(alvoEdicao.id, dados);
    if (atualizado) {
      setDialogEditarAberto(false);
      recarregarSessao();
    }
  }

  return (
    <ShellComSidebar titulo="Meu perfil" subtitulo="Consulte e atualize seus dados básicos">
      <Card sx={{ maxWidth: 720, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 3 }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              <strong>Nome:</strong> {usuario?.primeiroNome ?? ''} {usuario?.sobrenome ?? ''}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              <strong>Email:</strong> {usuario?.email ?? 'Nao informado'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              <strong>Tempo cadastrado:</strong> {formatarTempoCadastro(usuario?.dataHoraCriacao)}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              <strong>Permissão:</strong> {descreverPermissao(usuario?.permissao ?? -1)}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              <strong>Status:</strong> {usuario?.isDeleted ? 'Inativo' : 'Ativo'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', pt: 0.5 }}>
              A alteração de permissão é feita apenas por um administrador, em Usuários.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, pt: 1 }}>
              <Button
                variant="contained"
                onClick={() => {
                  if (usuarioAtual) {
                    setAlvoEdicao(usuarioAtual);
                    setDialogEditarAberto(true);
                  }
                }}
              >
                Editar meus dados
              </Button>
              <Button variant="outlined" onClick={recarregarSessao}>
                Atualizar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {erro ? (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 720 }}>
          {erro}
        </Alert>
      ) : null}

      <Dialog open={dialogEditarAberto} onClose={carregandoAcao ? undefined : () => setDialogEditarAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar meus dados</DialogTitle>
        <DialogContent>
          <FormularioUsuario
            usuario={alvoEdicao}
            permissaoEdicao="somenteLeitura"
            carregando={carregandoAcao}
            onSubmit={salvarEdicao}
          />
        </DialogContent>
      </Dialog>

      <Snackbar open={Boolean(sucesso)} autoHideDuration={3500} onClose={limparFeedback}>
        <Alert severity="success" onClose={limparFeedback} sx={{ width: '100%' }}>
          {sucesso}
        </Alert>
      </Snackbar>
    </ShellComSidebar>
  );
}
