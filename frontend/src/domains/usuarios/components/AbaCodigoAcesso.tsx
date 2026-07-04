import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { CampoSenha } from '../../../shared/components/CampoSenha';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useCodigoSeguranca } from '../hooks/useCodigoSeguranca';

type Props = {
  podeEditar: boolean;
};

export function AbaCodigoAcesso({ podeEditar }: Props) {
  const { cores } = useTemaApp();
  const { codigo, carregando, salvando, erro, sucesso, apiDisponivel, salvar } =
    useCodigoSeguranca(podeEditar);
  const [valor, setValor] = useState('');

  useEffect(() => {
    setValor(codigo ?? '');
  }, [codigo]);

  const exibicao = codigo?.trim() ? codigo : '—';
  const Icone = podeEditar ? LockOutlinedIcon : VisibilityOutlinedIcon;

  async function aoSalvar() {
    await salvar(valor);
  }

  return (
    <Card sx={{ borderRadius: 3, bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, boxShadow: cores.sombraCard }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Icone sx={{ color: cores.focus }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                Código de acesso
              </Typography>
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                {podeEditar
                  ? 'Código exigido no primeiro acesso (pré-login), antes da tela de login. Somente administradores podem alterá-lo.'
                  : 'Código exigido no primeiro acesso (pré-login). Você pode visualizar o código atual; apenas administradores podem alterá-lo.'}
              </Typography>
            </Box>
          </Stack>

          {!apiDisponivel && !carregando ? (
            <Alert severity={podeEditar ? 'warning' : 'info'}>
              {podeEditar
                ? 'Não foi possível conectar ao servidor agora. As alterações ficam salvas apenas neste navegador até a reconexão.'
                : 'Não foi possível obter o código do servidor no momento.'}
            </Alert>
          ) : null}

          {erro ? <Alert severity={podeEditar ? 'error' : 'warning'}>{erro}</Alert> : null}
          {sucesso && podeEditar ? <Alert severity="success">{sucesso}</Alert> : null}

          {carregando ? (
            <Stack direction="row" spacing={1.5} sx={{ py: 2, alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ color: cores.textSecondary }}>
                Carregando código…
              </Typography>
            </Stack>
          ) : podeEditar ? (
            <>
              <CampoSenha
                label="Código de acesso"
                visivelInicial
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                fullWidth
                disabled={salvando}
                placeholder="Informe o código do sistema"
                helperText="Usuários em primeiro acesso precisam informar este código antes de ver a tela de login. Use de 4 a 64 caracteres, sem espaços."
                sx={estilosCampoFormulario(cores)}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="contained"
                  startIcon={salvando ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                  disabled={salvando || valor.trim() === (codigo ?? '')}
                  onClick={() => void aoSalvar()}
                >
                  Salvar código
                </Button>
              </Stack>
            </>
          ) : (
            <TextField
              label="Código atual do sistema"
              value={exibicao}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
              helperText="Você não tem permissão para alterar este código."
              sx={{
                ...estilosCampoFormulario(cores),
                '& .MuiInputBase-input': { fontWeight: 700, letterSpacing: 1.5, fontFamily: 'monospace' },
              }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
