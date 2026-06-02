import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';

type Props = {
  aberto: boolean;
  titulo: string;
  descricao: string;
  carregando?: boolean;
  erro?: string | null;
  errosValidacao?: string[] | null;
  onFechar: () => void;
  onConfirmar: (senhaConfirmacao: string) => void;
};

export function ModalConfirmacaoSenha({
  aberto,
  titulo,
  descricao,
  carregando = false,
  erro,
  errosValidacao,
  onFechar,
  onConfirmar,
}: Props) {
  const [senha, setSenha] = useState('');

  useEffect(() => {
    if (!aberto) setSenha('');
  }, [aberto]);

  const resumoErro = erro ?? (errosValidacao?.length ? MSG_ERRO.validacaoResumo : null);

  return (
    <Dialog open={aberto} onClose={carregando ? undefined : onFechar} fullWidth maxWidth="xs">
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2">{descricao}</Typography>
          {resumoErro || errosValidacao?.length ? (
            <Alert severity="error">
              {resumoErro}
              {errosValidacao?.length ? (
                <Box component="ul" sx={{ pl: 2.2, my: resumoErro ? 1 : 0, mb: 0 }}>
                  {errosValidacao.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </Box>
              ) : null}
            </Alert>
          ) : null}
          <TextField
            label="Senha do usuário logado"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoFocus
            required
            fullWidth
            slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onFechar} disabled={carregando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={carregando || senha.trim().length < 6}
          onClick={() => onConfirmar(senha.trim())}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
