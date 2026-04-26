import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  aberto: boolean;
  carregando: boolean;
  erro: string | null;
  onFechar: () => void;
  onConfirmar: (senhaAtual: string, novaSenha: string) => void;
};

export function ModalTrocarSenha({ aberto, carregando, erro, onFechar, onConfirmar }: Props) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('');

  useEffect(() => {
    if (!aberto) {
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacaoNovaSenha('');
    }
  }, [aberto]);

  const valido = useMemo(() => {
    if (senhaAtual.trim().length < 1) return false;
    if (novaSenha.length < 6 || novaSenha.length > 100) return false;
    return novaSenha === confirmacaoNovaSenha;
  }, [senhaAtual, novaSenha, confirmacaoNovaSenha]);

  return (
    <Dialog open={aberto} onClose={carregando ? undefined : onFechar} fullWidth maxWidth="sm">
      <DialogTitle>Alterar senha</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          {erro ? <Alert severity="error">{erro}</Alert> : null}
          <TextField
            label="Senha atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />
          <TextField
            label="Nova senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
            helperText="Mínimo 6 caracteres."
            autoComplete="new-password"
          />
          <TextField
            label="Confirmar nova senha"
            type="password"
            value={confirmacaoNovaSenha}
            onChange={(e) => setConfirmacaoNovaSenha(e.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
            autoComplete="new-password"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onFechar} disabled={carregando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={carregando || !valido}
          onClick={() => onConfirmar(senhaAtual, novaSenha)}
        >
          Salvar nova senha
        </Button>
      </DialogActions>
    </Dialog>
  );
}
