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
  onConfirmar: (senhaAtual: string, senhaNova: string) => void;
};

export function ModalTrocarSenha({ aberto, carregando, erro, onFechar, onConfirmar }: Props) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaNova2, setSenhaNova2] = useState('');

  useEffect(() => {
    if (!aberto) {
      setSenhaAtual('');
      setSenhaNova('');
      setSenhaNova2('');
    }
  }, [aberto]);

  const valido = useMemo(() => {
    if (senhaAtual.trim().length < 1) return false;
    if (senhaNova.length < 6 || senhaNova.length > 100) return false;
    return senhaNova === senhaNova2;
  }, [senhaAtual, senhaNova, senhaNova2]);

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
            value={senhaNova}
            onChange={(e) => setSenhaNova(e.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
            helperText="Mínimo 6 caracteres."
            autoComplete="new-password"
          />
          <TextField
            label="Confirmar nova senha"
            type="password"
            value={senhaNova2}
            onChange={(e) => setSenhaNova2(e.target.value)}
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
          onClick={() => onConfirmar(senhaAtual, senhaNova)}
        >
          Salvar nova senha
        </Button>
      </DialogActions>
    </Dialog>
  );
}
