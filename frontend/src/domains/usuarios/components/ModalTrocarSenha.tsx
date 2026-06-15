import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { CampoSenha } from '../../../shared/components/CampoSenha';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';

type Props = {
  aberto: boolean;
  carregando: boolean;
  erro: string | null;
  errosValidacao?: string[] | null;
  onFechar: () => void;
  onConfirmar: (senhaAtual: string, novaSenha: string) => void;
};

export function ModalTrocarSenha({ aberto, carregando, erro, errosValidacao, onFechar, onConfirmar }: Props) {
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

  const resumoErro = erro ?? (errosValidacao?.length ? MSG_ERRO.validacaoResumo : null);

  return (
    <Dialog open={aberto} onClose={carregando ? undefined : onFechar} fullWidth maxWidth="sm">
      <DialogTitle>Alterar senha</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
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
          <CampoSenha
            label="Senha atual"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />
          <CampoSenha
            label="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
            helperText="Mínimo 6 caracteres."
            autoComplete="new-password"
          />
          <CampoSenha
            label="Confirmar nova senha"
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
