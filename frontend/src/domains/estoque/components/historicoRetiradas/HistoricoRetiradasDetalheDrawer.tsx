import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { HistoricoRetiradasStatusChip } from './HistoricoRetiradasStatusChip';
import { partesInstanteAuditavel } from '../../utils/historicoRetiradasDataFormat';
import type { RetiradaHistoricoItemDto } from '../../types/tiposEstoque';

type Props = {
  /** Retirada selecionada ou null quando fechado. */
  aberto: RetiradaHistoricoItemDto | null;
  aoFechar: () => void;
};

function LinhaCampo({
  titulo,
  valor,
  sub,
}: {
  titulo: string;
  valor: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {titulo}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5, wordBreak: 'break-word', fontWeight: 600 }}>
        {valor}
      </Typography>
      {sub}
    </Paper>
  );
}

/** Drawer com leitura clara dos campos de auditoria; evita dispersão horizontal em telas de operação. */
export function HistoricoRetiradasDetalheDrawer({ aberto: retirada, aoFechar }: Props) {
  const abertoBoolean = Boolean(retirada);

  const partes = retirada ? partesInstanteAuditavel(retirada.dataHoraRetirada) : null;

  return (
    <Drawer
      anchor="right"
      open={abertoBoolean}
      onClose={aoFechar}
      ModalProps={{
        hideBackdrop: false,
      }}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            maxWidth: { xs: '100%', sm: 560 },
          },
        },
      }}
      aria-label="Detalhes da retirada"
    >
      <Stack sx={{ height: '100%', overflow: 'auto' }}>
        <Box
          sx={{
            p: 2,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Detalhes da retirada {retirada ? `#${retirada.id}` : ''}
          </Typography>
          <IconButton onClick={aoFechar} aria-label="Fechar detalhes">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {!retirada ? null : (
          <Stack sx={{ p: 2, gap: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ flexWrap: 'wrap', gap: { xs: 2, sm: 2 } }}
            >
              <LinhaCampo titulo="ID da retirada" valor={retirada.id} />
              <LinhaCampo
                titulo="Status"
                valor={<HistoricoRetiradasStatusChip status={retirada.status} />}
              />
            </Stack>

            <LinhaCampo
              titulo="Data e horário"
              valor={
                <Stack spacing={0.75}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {partes!.dataLocal} · {partes!.horaLocal}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Horário de Brasília · referência técnica UTC: {partes!.tecnicoUtc}
                  </Typography>
                </Stack>
              }
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <LinhaCampo
                titulo="Produto"
                valor={
                  <Stack spacing={0.35}>
                    <Typography component="span" sx={{ fontWeight: 700 }}>
                      {retirada.nomeProduto}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Código: {retirada.codigo}
                    </Typography>
                  </Stack>
                }
              />
              <LinhaCampo titulo="Lote" valor={retirada.lote} />
            </Stack>

            <LinhaCampo titulo="Quantidade retirada" valor={<Typography sx={{ fontSize: '1.25rem' }}>{retirada.quantidade}</Typography>} />

            <Divider />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Pessoas
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <LinhaCampo
                titulo="Quem retirou"
                valor={retirada.usuarioRetiranteExibicao}
                sub={
                  retirada.idUsuarioRetirante != null ? (
                    <Typography variant="caption" color="text.secondary">
                      Usuário vinculado (ID cadastro): {retirada.idUsuarioRetirante}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="warning.main">
                      Sem vínculo com cadastro neste lançamento.
                    </Typography>
                  )
                }
              />
              <LinhaCampo
                titulo="Destinatário / quem recebeu"
                valor={retirada.usuarioRecebedorExibicao}
                sub={
                  retirada.idUsuarioRecebedor != null ? (
                    <Typography variant="caption" color="text.secondary">
                      Usuário vinculado (ID cadastro): {retirada.idUsuarioRecebedor}
                    </Typography>
                  ) : undefined
                }
              />
            </Stack>

            <LinhaCampo
              titulo="Observação / motivo"
              valor={
                retirada.observacao?.trim().length ? retirada.observacao : '— não informado neste lançamento'
              }
            />

            <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Nota de auditoria
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Os horários são apresentados no horário de Brasília para operação; o instante oficial armazenado pela API
                está em formato ISO UTC.
              </Typography>
            </Box>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}
