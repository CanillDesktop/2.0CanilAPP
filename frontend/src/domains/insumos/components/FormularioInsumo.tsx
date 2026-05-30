import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from '@mui/material';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutFormularioCadastro, SecaoFormularioCadastro } from '../../../shared/components/LayoutFormularioCadastro';
import { PainelErro } from '../../../shared/components/PainelErro';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { useMutacaoInsumo } from '../hooks/useInsumos';
import type { InsumoCadastroDto } from '../types/tiposInsumos';

const OPCOES_UNIDADE = [
  { valor: 1, rotulo: 'Unidade' },
  { valor: 2, rotulo: 'Kg' },
  { valor: 3, rotulo: 'Litro' },
];

export function FormularioInsumo() {
  const navegar = useNavigate();
  const { criar, carregando, erro, errosValidacao } = useMutacaoInsumo();
  const estilos = useEstilosListagem();
  const sxCampo = estilosCampoFormulario(estilos.cores);

  const [descricaoSimplificada, setDescricaoSimplificada] = useState('');
  const [descricaoDetalhada, setDescricaoDetalhada] = useState('');
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [nfe, setNfe] = useState('');
  const [unidade, setUnidade] = useState(1);
  const [dataValidade, setDataValidade] = useState('');
  const [nivelMinimoEstoque, setNivelMinimoEstoque] = useState(0);
  const [submitSucesso, setSubmitSucesso] = useState(false);
  const [submitErro, setSubmitErro] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const formularioValido = useMemo(
    () =>
      descricaoSimplificada.trim().length > 0 &&
      descricaoDetalhada.trim().length > 0 &&
      dataEntrega.trim().length > 0 &&
      Number.isFinite(unidade) &&
      unidade > 0 &&
      Number.isFinite(quantidade) &&
      quantidade >= 0 &&
      Number.isFinite(nivelMinimoEstoque) &&
      nivelMinimoEstoque >= 0,
    [descricaoSimplificada, descricaoDetalhada, dataEntrega, unidade, quantidade, nivelMinimoEstoque],
  );

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido || carregando) return;
    setSubmitErro(false);
    setSubmitSucesso(false);

    const dto: InsumoCadastroDto = {
      descricaoSimplificada,
      descricaoDetalhada,
      lote: lote.trim() || null,
      quantidade,
      dataEntrega: new Date(dataEntrega).toISOString(),
      nfe,
      unidade,
      dataValidade: dataValidade ? new Date(dataValidade).toISOString() : null,
      nivelMinimoEstoque,
    };

    const ok = await criar(dto);
    if (!ok) {
      setSubmitErro(true);
      setSnackbar({
        open: true,
        message: 'Erro ao criar insumo. Verifique os dados e tente novamente.',
        severity: 'error',
      });
      return;
    }

    setSubmitSucesso(true);
    setSnackbar({
      open: true,
      message: 'Insumo criado com sucesso! Redirecionando...',
      severity: 'success',
    });
    window.setTimeout(() => navegar('/insumos'), 550);
  }

  return (
    <LayoutFormularioCadastro
      titulo="Novo insumo"
      subtitulo="Informe a identificação do insumo e, se houver, o lote inicial de entrada."
      rotaVoltar="/insumos"
      rotuloVoltar="Voltar para insumos"
    >
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />

      <Box component="form" onSubmit={aoEnviar}>
        <SecaoFormularioCadastro titulo="Dados do insumo">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Descrição simplificada"
                value={descricaoSimplificada}
                onChange={(e) => setDescricaoSimplificada(e.target.value)}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={sxCampo}>
                <InputLabel id="unidade-label">Unidade</InputLabel>
                <Select
                  labelId="unidade-label"
                  label="Unidade"
                  value={unidade}
                  onChange={(e) => setUnidade(Number(e.target.value))}
                >
                  {OPCOES_UNIDADE.map((opcao) => (
                    <MenuItem key={opcao.valor} value={opcao.valor}>
                      {opcao.rotulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                required
                label="Descrição detalhada"
                value={descricaoDetalhada}
                onChange={(e) => setDescricaoDetalhada(e.target.value)}
                multiline
                minRows={3}
                sx={sxCampo}
              />
            </Grid>
          </Grid>
        </SecaoFormularioCadastro>

        <SecaoFormularioCadastro titulo="Estoque inicial">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Lote inicial"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Quantidade inicial"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 0 } }}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Data de entrega"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Data de validade"
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="NF-e / documento"
                value={nfe}
                onChange={(e) => setNfe(e.target.value)}
                sx={sxCampo}
              />
            </Grid>
          </Grid>
        </SecaoFormularioCadastro>

        <SecaoFormularioCadastro titulo="Configurações">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Nível mínimo de estoque"
                value={nivelMinimoEstoque}
                onChange={(e) => setNivelMinimoEstoque(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 0 } }}
                sx={sxCampo}
              />
            </Grid>
          </Grid>
        </SecaoFormularioCadastro>

        <LoadingButton
          type="submit"
          loading={carregando}
          loadingPosition="start"
          startIcon={submitSucesso ? <CheckIcon /> : submitErro ? <SendIcon /> : <SaveIcon />}
          variant="contained"
          size="large"
          fullWidth
          disabled={!formularioValido || carregando}
          color={submitSucesso ? 'success' : submitErro ? 'error' : 'primary'}
          sx={{
            ...estilos.botaoPrimario,
            mt: 1,
            py: 1.2,
            transition: '0.2s',
            '&:hover': { transform: 'scale(1.01)', backgroundColor: estilos.cores.accentHover },
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          {submitSucesso ? 'Criado com sucesso' : 'Criar insumo'}
        </LoadingButton>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((estado) => ({ ...estado, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((estado) => ({ ...estado, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LayoutFormularioCadastro>
  );
}
