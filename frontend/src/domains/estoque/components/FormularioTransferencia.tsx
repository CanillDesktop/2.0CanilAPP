import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';
import { PainelErro } from '../../../shared/components/PainelErro';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { UnidadeEstoqueIds } from '../constants/unidadesEstoque';
import { useTransferenciasEstoque } from '../hooks/useTransferencias';
import type { TransferenciaEstoqueItemDto } from '../types/tiposTransferencia';

type LinhaItem = TransferenciaEstoqueItemDto & { chave: string };

function novaLinha(): LinhaItem {
  return { chave: crypto.randomUUID(), idItem: 0, lote: '', quantidade: 1 };
}

export function FormularioTransferencia() {
  const navegar = useNavigate();
  const { cores } = useTemaApp();
  const { unidadeAtivaId, permissoesAtivas, contexto } = useUnidadeEstoque();
  const campoSx = estilosCampoFormulario(cores);
  const { enviar, salvando, erro, errosValidacao } = useTransferenciasEstoque();

  const destinos = useMemo(
    () => (contexto?.unidadesDisponiveis ?? []).filter((u) => u.id !== unidadeAtivaId),
    [contexto, unidadeAtivaId],
  );

  const [idDestino, setIdDestino] = useState<number>(
    unidadeAtivaId === UnidadeEstoqueIds.Secretaria ? UnidadeEstoqueIds.Canil : UnidadeEstoqueIds.Secretaria,
  );
  const [observacao, setObservacao] = useState('');
  const [itens, setItens] = useState<LinhaItem[]>([novaLinha()]);

  const semPermissao = !permissoesAtivas?.podeTransferirEnviar;
  const formularioValido =
    !semPermissao &&
    idDestino > 0 &&
    itens.length > 0 &&
    itens.every((i) => i.idItem > 0 && i.lote.trim().length > 0 && i.quantidade > 0);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido) return;
    const resultado = await enviar({
      idUnidadeDestino: idDestino,
      observacao: observacao || null,
      itens: itens.map(({ idItem, lote, quantidade }) => ({ idItem, lote, quantidade })),
    });
    if (resultado.ok) navegar('/estoque/transferencias');
  }

  return (
    <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 2 } }}>
      <Card sx={{ maxWidth: 820, mx: 'auto', bgcolor: cores.bgCard, border: `1px solid ${cores.border}`, borderRadius: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={aoEnviar}>
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: cores.textPrimary }}>
                Nova transferência
              </Typography>
              <PainelErro
                mensagem={semPermissao ? 'Você não tem permissão para enviar transferências nesta unidade.' : erro}
                errosValidacao={errosValidacao}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth sx={campoSx}>
                    <InputLabel id="destino-label">Unidade destino</InputLabel>
                    <Select
                      labelId="destino-label"
                      label="Unidade destino"
                      value={idDestino}
                      onChange={(e) => setIdDestino(Number(e.target.value))}
                    >
                      {destinos.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Observação"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    multiline
                    minRows={2}
                    sx={campoSx}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ color: cores.textPrimary, fontWeight: 700 }}>
                Itens
              </Typography>
              {itens.map((item, idx) => (
                <Grid container spacing={1.5} key={item.chave} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="ID do item"
                      value={item.idItem || ''}
                      onChange={(e) =>
                        setItens((atual) =>
                          atual.map((l, i) => (i === idx ? { ...l, idItem: Number(e.target.value) } : l)),
                        )
                      }
                      sx={campoSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Lote"
                      value={item.lote}
                      onChange={(e) =>
                        setItens((atual) =>
                          atual.map((l, i) => (i === idx ? { ...l, lote: e.target.value } : l)),
                        )
                      }
                      sx={campoSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 10, md: 3 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantidade"
                      value={item.quantidade}
                      onChange={(e) =>
                        setItens((atual) =>
                          atual.map((l, i) => (i === idx ? { ...l, quantidade: Number(e.target.value) } : l)),
                        )
                      }
                      slotProps={{ htmlInput: { min: 1 } }}
                      sx={campoSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 2, md: 2 }}>
                    <IconButton
                      aria-label="Remover item"
                      disabled={itens.length <= 1}
                      onClick={() => setItens((atual) => atual.filter((_, i) => i !== idx))}
                    >
                      <DeleteOutlineOutlinedIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button startIcon={<AddIcon />} onClick={() => setItens((atual) => [...atual, novaLinha()])}>
                Adicionar item
              </Button>
              <LoadingButton
                type="submit"
                loading={salvando}
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="contained"
                disabled={!formularioValido || salvando}
                sx={{ backgroundColor: cores.accent, color: cores.textOnAccent }}
              >
                Enviar transferência
              </LoadingButton>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
