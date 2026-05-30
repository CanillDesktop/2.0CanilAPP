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
import { useTemaApp } from '../../../../app/providers/ContextoTemaApp';
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
  const { cores } = useTemaApp();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: cores.bgInput,
        borderColor: cores.border,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, color: cores.textMuted }}>
        {titulo}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5, wordBreak: 'break-word', fontWeight: 600, color: cores.textPrimary }}>
        {valor}
      </Typography>
      {sub}
    </Paper>
  );
}

/** Drawer com leitura clara dos campos de auditoria; evita dispersão horizontal em telas de operação. */
export function HistoricoRetiradasDetalheDrawer({ aberto: retirada, aoFechar }: Props) {
  const { cores } = useTemaApp();
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
            bgcolor: cores.bgCard,
            color: cores.textPrimary,
            borderLeft: `1px solid ${cores.border}`,
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
          <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
            Detalhes da retirada {retirada ? `#${retirada.id}` : ''}
          </Typography>
          <IconButton onClick={aoFechar} aria-label="Fechar detalhes" sx={{ color: cores.textPrimary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: cores.border }} />

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
                  <Typography variant="body1" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                    {partes!.dataLocal} · {partes!.horaLocal}
                  </Typography>
                  <Typography variant="caption" sx={{ color: cores.textMuted }}>
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
                    <Typography component="span" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                      {retirada.nomeProduto}
                    </Typography>
                    <Typography variant="caption" sx={{ color: cores.textMuted }}>
                      Código: {retirada.codigo}
                    </Typography>
                  </Stack>
                }
              />
              <LinhaCampo titulo="Lote" valor={retirada.lote} />
            </Stack>

            <LinhaCampo
              titulo="Quantidade retirada"
              valor={<Typography sx={{ fontSize: '1.25rem', color: cores.textPrimary }}>{retirada.quantidade}</Typography>}
            />

            <Divider sx={{ borderColor: cores.border }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: cores.textMuted }}>
              Pessoas
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <LinhaCampo
                titulo="Quem retirou"
                valor={retirada.usuarioRetiranteExibicao}
                sub={
                  retirada.idUsuarioRetirante != null ? (
                    <Typography variant="caption" sx={{ color: cores.textMuted }}>
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
                    <Typography variant="caption" sx={{ color: cores.textMuted }}>
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

            <Box sx={{ bgcolor: cores.metricCardBg, borderRadius: 2, p: 1.5, border: `1px solid ${cores.metricCardBorder}` }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: cores.textMuted }}>
                Nota de auditoria
              </Typography>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: cores.textSecondary }}>
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
