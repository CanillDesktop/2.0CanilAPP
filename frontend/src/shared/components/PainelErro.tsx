import { Alert, Box } from '@mui/material';
import { MSG_ERRO } from '../constants/mensagensErroUsuario';

type ErroProps = {
  mensagem: string | null;
  errosValidacao?: string[] | null;
};

export function PainelErro({ mensagem, errosValidacao }: ErroProps) {
  if (!mensagem && !errosValidacao?.length) return null;

  const resumo =
    mensagem ??
    (errosValidacao?.length ? MSG_ERRO.validacaoResumo : null);

  if (!resumo && !errosValidacao?.length) return null;

  return (
    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
      {resumo}
      {errosValidacao?.length ? (
        <Box component="ul" sx={{ pl: 2.2, my: resumo ? 1 : 0, mb: 0 }}>
          {errosValidacao.map((erro) => (
            <li key={erro}>{erro}</li>
          ))}
        </Box>
      ) : null}
    </Alert>
  );
}
