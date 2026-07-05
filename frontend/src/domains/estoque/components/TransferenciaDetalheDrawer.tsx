import CloseIcon from '@mui/icons-material/Close';

import type { ReactNode } from 'react';

import {

  Box,

  Button,

  Chip,

  Divider,

  Drawer,

  IconButton,

  Paper,

  Stack,

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableRow,

  Typography,

  useMediaQuery,

  useTheme,

} from '@mui/material';

import { useTemaApp } from '../../../app/providers/ContextoTemaApp';

import type { TransferenciaEstoqueItemLeituraDto, TransferenciaEstoqueLeituraDto } from '../types/tiposTransferencia';



type Props = {

  transferencia: TransferenciaEstoqueLeituraDto | null;

  aoFechar: () => void;

  onConfirmarRecebimento?: (id: number) => void;

  podeReceber?: boolean;

  recebendo?: boolean;

};



function rotuloDestino(nome?: string | null) {

  return nome?.trim() ? nome : 'Sem destino';

}



function rotuloOuTraco(valor?: string | null) {

  return valor?.trim() ? valor : '—';

}



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

        flex: 1,

        minWidth: 0,

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



function CardItemMobile({ item }: { item: TransferenciaEstoqueItemLeituraDto }) {

  const { cores } = useTemaApp();



  return (

    <Paper

      variant="outlined"

      sx={{

        p: 1.5,

        borderRadius: 2,

        borderColor: cores.border,

        bgcolor: cores.bgInput,

      }}

    >

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: cores.textPrimary, wordBreak: 'break-word' }}>

        {item.nomeItem}

      </Typography>

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, mt: 1 }}>

        <Box>

          <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block' }}>

            Código

          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 600, color: cores.textPrimary }}>

            {item.codigo}

          </Typography>

        </Box>

        <Box>

          <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block' }}>

            Lote

          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 600, color: cores.textPrimary }}>

            {item.lote}

          </Typography>

        </Box>

        <Box>

          <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block' }}>

            Quantidade

          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 800, color: cores.textPrimary }}>

            {item.quantidade}

          </Typography>

        </Box>

      </Stack>

    </Paper>

  );

}



export function TransferenciaDetalheDrawer({

  transferencia,

  aoFechar,

  onConfirmarRecebimento,

  podeReceber = false,

  recebendo = false,

}: Props) {

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { cores } = useTemaApp();

  const aberto = Boolean(transferencia);



  const pendente =

    transferencia &&

    (transferencia.status.toLowerCase().includes('pend') || transferencia.status.toUpperCase() === 'ENVIADA');

  const ehEntrada = transferencia?.tipoMovimento.trim().toLowerCase() === 'entrada';

  const mostrarReceber = Boolean(pendente && ehEntrada && podeReceber && onConfirmarRecebimento);



  const botaoConfirmar = mostrarReceber && transferencia ? (

    <Button

      fullWidth={isMobile}

      variant="contained"

      disabled={recebendo}

      onClick={() => onConfirmarRecebimento?.(transferencia.id)}

      sx={{

        fontWeight: 700,

        minHeight: { xs: 48, sm: 'auto' },

        bgcolor: cores.accent,

        color: cores.textOnAccent,

      }}

    >

      Confirmar recebimento

    </Button>

  ) : null;



  return (

    <Drawer

      anchor="right"

      open={aberto}

      onClose={aoFechar}

      slotProps={{

        paper: {

          sx: {

            width: '100%',

            maxWidth: { xs: '100%', sm: 620 },

            bgcolor: cores.bgCard,

            color: cores.textPrimary,

            borderLeft: `1px solid ${cores.border}`,

          },

        },

      }}

      aria-label="Detalhes da transferência"

    >

      <Stack sx={{ height: '100%', minHeight: 0 }}>

        <Box

          sx={{

            p: { xs: 1.5, sm: 2 },

            pb: 1,

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'space-between',

            gap: 1,

            flexShrink: 0,

          }}

        >

          <Typography

            variant="h6"

            sx={{

              fontWeight: 700,

              color: cores.textPrimary,

              flex: 1,

              minWidth: 0,

              wordBreak: 'break-word',

              pr: 1,

            }}

          >

            Transferência {transferencia ? `#${transferencia.id}` : ''}

          </Typography>

          <IconButton

            onClick={aoFechar}

            aria-label="Fechar detalhes"

            sx={{ color: cores.textPrimary, flexShrink: 0, minWidth: 44, minHeight: 44 }}

          >

            <CloseIcon />

          </IconButton>

        </Box>



        <Divider sx={{ borderColor: cores.border, flexShrink: 0 }} />



        {!transferencia ? null : (

          <>

            <Stack

              sx={{

                flex: 1,

                minHeight: 0,

                overflow: 'auto',

                WebkitOverflowScrolling: 'touch',

                p: { xs: 1.5, sm: 2 },

                gap: 2,

                pb: mostrarReceber && isMobile ? 2 : { xs: 1.5, sm: 2 },

              }}

            >

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>

                <Chip

                  size="small"

                  label={transferencia.tipoMovimento.trim().toLowerCase() === 'entrada' ? 'Entrada' : 'Saída'}

                  color={transferencia.tipoMovimento.trim().toLowerCase() === 'entrada' ? 'success' : 'warning'}

                  sx={{ fontWeight: 700 }}

                />

                <Chip size="small" label={transferencia.status} sx={{ fontWeight: 700 }} />

              </Stack>



              <LinhaCampo

                titulo="Data e horário"

                valor={new Date(transferencia.dataTransferencia).toLocaleString('pt-BR')}

              />



              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>

                <LinhaCampo titulo="Unidade origem" valor={transferencia.unidadeOrigemNome} />

                <LinhaCampo titulo="Unidade destino" valor={rotuloDestino(transferencia.unidadeDestinoNome)} />

              </Stack>



              <Divider sx={{ borderColor: cores.border }} />



              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: cores.textMuted }}>

                Responsáveis

              </Typography>



              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>

                <LinhaCampo

                  titulo="Quem realizou"

                  valor={rotuloOuTraco(transferencia.responsavelEnvio || transferencia.usuarioEnvio)}

                  sub={

                    transferencia.usuarioEnvio?.trim() &&

                    transferencia.responsavelEnvio?.trim() &&

                    transferencia.usuarioEnvio !== transferencia.responsavelEnvio ? (

                      <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block', mt: 0.5, wordBreak: 'break-word' }}>

                        Usuário do sistema: {transferencia.usuarioEnvio}

                      </Typography>

                    ) : transferencia.usuarioEnvio?.trim() ? (

                      <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block', mt: 0.5, wordBreak: 'break-word' }}>

                        Registrado por: {transferencia.usuarioEnvio}

                      </Typography>

                    ) : undefined

                  }

                />

                <LinhaCampo

                  titulo="Quem recebe (informado)"

                  valor={rotuloOuTraco(transferencia.responsavelRecebimento)}

                  sub={

                    transferencia.usuarioRecebimento?.trim() ? (

                      <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block', mt: 0.5, wordBreak: 'break-word' }}>

                        Recebimento confirmado por: {transferencia.usuarioRecebimento}

                      </Typography>

                    ) : undefined

                  }

                />

              </Stack>



              <LinhaCampo titulo="Observação" valor={rotuloOuTraco(transferencia.observacao)} />



              <Divider sx={{ borderColor: cores.border }} />



              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: cores.textMuted }}>

                Itens ({transferencia.itens.length})

              </Typography>



              {isMobile ? (

                <Stack spacing={1.25}>

                  {transferencia.itens.map((item) => (

                    <CardItemMobile key={`${item.idItem}-${item.lote}`} item={item} />

                  ))}

                </Stack>

              ) : (

                <Paper variant="outlined" sx={{ borderColor: cores.border, overflow: 'auto' }}>

                  <Table size="small">

                    <TableHead>

                      <TableRow>

                        <TableCell>Código</TableCell>

                        <TableCell>Item</TableCell>

                        <TableCell>Lote</TableCell>

                        <TableCell align="right">Qtd.</TableCell>

                      </TableRow>

                    </TableHead>

                    <TableBody>

                      {transferencia.itens.map((item) => (

                        <TableRow key={`${item.idItem}-${item.lote}`}>

                          <TableCell>{item.codigo}</TableCell>

                          <TableCell>{item.nomeItem}</TableCell>

                          <TableCell>{item.lote}</TableCell>

                          <TableCell align="right">{item.quantidade}</TableCell>

                        </TableRow>

                      ))}

                    </TableBody>

                  </Table>

                </Paper>

              )}



              {mostrarReceber && !isMobile ? (

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{botaoConfirmar}</Box>

              ) : null}

            </Stack>



            {mostrarReceber && isMobile ? (

              <Box

                sx={{

                  flexShrink: 0,

                  p: 1.5,

                  pt: 1,

                  borderTop: `1px solid ${cores.border}`,

                  bgcolor: cores.bgCard,

                  pb: 'max(12px, env(safe-area-inset-bottom))',

                }}

              >

                {botaoConfirmar}

              </Box>

            ) : null}

          </>

        )}

      </Stack>

    </Drawer>

  );

}

