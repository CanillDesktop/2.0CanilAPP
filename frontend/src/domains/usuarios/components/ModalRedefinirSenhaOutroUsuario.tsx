import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { CampoSenha } from '../../../shared/components/CampoSenha';
import { PainelErro } from '../../../shared/components/PainelErro';
import type { UsuarioSenhaResumoDto } from '../types/tiposUsuarios';

type Props = {
  aberto: boolean;
  carregando: boolean;
  erro: string | null;
  errosValidacao: string[] | null;
  resumoSenha: UsuarioSenhaResumoDto | null;
  carregandoResumo: boolean;
  nomeUsuario?: string;
  onFechar: () => void;
  onConfirmar: (novaSenha: string, senhaConfirmacao: string) => void;
};

export function SecaoSenhaOutroUsuario({
  resumoSenha,
  carregandoResumo,
  podeAlterar,
  novaSenha,
  confirmacaoNovaSenha,
  onNovaSenhaChange,
  onConfirmacaoChange,
}: {
  resumoSenha: UsuarioSenhaResumoDto | null;
  carregandoResumo: boolean;
  podeAlterar: boolean;
  novaSenha: string;
  confirmacaoNovaSenha: string;
  onNovaSenhaChange: (valor: string) => void;
  onConfirmacaoChange: (valor: string) => void;
}) {
  const senhasDivergem = confirmacaoNovaSenha.length > 0 && novaSenha !== confirmacaoNovaSenha;

  return (
    <Stack spacing={1.5} sx={{ pt: 0.5 }}>
      <Typography variant="subtitle2">Senha de acesso</Typography>
      {carregandoResumo ? (
        <Typography variant="body2" color="text.secondary">
          Consultando status da senha…
        </Typography>
      ) : resumoSenha ? (
        <Alert severity="info" sx={{ py: 0.5 }}>
          {resumoSenha.possuiSenhaDefinida
            ? 'Este usuário possui senha cadastrada.'
            : 'Este usuário ainda não possui senha cadastrada.'}{' '}
          Por segurança, o texto original não pode ser exibido (armazenamento com hash).
        </Alert>
      ) : (
        <Alert severity="info" sx={{ py: 0.5 }}>
          Por segurança, a senha atual não pode ser exibida (armazenamento com hash). Informe uma nova senha abaixo.
        </Alert>
      )}
      {podeAlterar ? (
        <>
          <CampoSenha
            label="Nova senha"
            value={novaSenha}
            onChange={(e) => onNovaSenhaChange(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
          />
          <CampoSenha
            label="Confirmar nova senha"
            value={confirmacaoNovaSenha}
            onChange={(e) => onConfirmacaoChange(e.target.value)}
            fullWidth
            error={senhasDivergem}
            helperText={senhasDivergem ? 'As senhas não coincidem.' : ' '}
            slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
          />
        </>
      ) : null}
    </Stack>
  );
}

export function ModalRedefinirSenhaOutroUsuario({
  aberto,
  carregando,
  erro,
  errosValidacao,
  resumoSenha,
  carregandoResumo,
  nomeUsuario,
  onFechar,
  onConfirmar,
}: Props) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('');
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');

  useEffect(() => {
    if (!aberto) {
      setNovaSenha('');
      setConfirmacaoNovaSenha('');
      setSenhaConfirmacao('');
    }
  }, [aberto]);

  const formularioValido = useMemo(() => {
    if (novaSenha.length < 6 || novaSenha.length > 100) return false;
    if (novaSenha !== confirmacaoNovaSenha) return false;
    if (senhaConfirmacao.trim().length < 1) return false;
    return true;
  }, [novaSenha, confirmacaoNovaSenha, senhaConfirmacao]);

  return (
    <Dialog open={aberto} onClose={carregando ? undefined : onFechar} fullWidth maxWidth="sm">
      <DialogTitle>Redefinir senha{nomeUsuario ? ` — ${nomeUsuario}` : ''}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <PainelErro mensagem={erro} errosValidacao={errosValidacao} />
          <SecaoSenhaOutroUsuario
            resumoSenha={resumoSenha}
            carregandoResumo={carregandoResumo}
            podeAlterar
            novaSenha={novaSenha}
            confirmacaoNovaSenha={confirmacaoNovaSenha}
            onNovaSenhaChange={setNovaSenha}
            onConfirmacaoChange={setConfirmacaoNovaSenha}
          />
          <CampoSenha
            label="Sua senha (confirmação)"
            value={senhaConfirmacao}
            onChange={(e) => setSenhaConfirmacao(e.target.value)}
            fullWidth
            helperText="Informe a senha da sua conta para autorizar a alteração."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onFechar} disabled={carregando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={carregando || !formularioValido}
          onClick={() => onConfirmar(novaSenha, senhaConfirmacao.trim())}
        >
          Redefinir senha
        </Button>
      </DialogActions>
    </Dialog>
  );
}
