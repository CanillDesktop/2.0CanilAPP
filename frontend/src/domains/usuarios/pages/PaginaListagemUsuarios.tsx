import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';

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
  if (permissao === 0) return 'Leitura';
  if (permissao === 1) return 'Operador';
  if (permissao === 2) return 'Administrador';
  return `Nivel ${permissao}`;
}

export function PaginaListagemUsuarios() {
  const { usuario, recarregarSessao } = useAutenticacao();

  return (
    <section>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Usuario
      </Typography>

      <Card sx={{ maxWidth: 720, borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={1.2}>
            <Typography variant="body1">
              <strong>Email:</strong> {usuario?.email ?? 'Nao informado'}
            </Typography>
            <Typography variant="body1">
              <strong>Tempo cadastrado:</strong> {formatarTempoCadastro(usuario?.dataHoraCriacao)}
            </Typography>
            <Typography variant="body1">
              <strong>Permissao:</strong> {descreverPermissao(usuario?.permissao ?? -1)}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, pt: 1 }}>
              <Button variant="contained" disabled>
                Trocar senha (em breve)
              </Button>
              <Button variant="outlined" onClick={recarregarSessao}>
                Atualizar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </section>
  );
}
