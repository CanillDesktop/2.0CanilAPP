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
import { useMutacaoMedicamento } from '../hooks/useMedicamentos';
import type { MedicamentoCadastroDto } from '../types/tiposMedicamentos';

const OPCOES_PRIORIDADE = [
  { valor: 0, rotulo: 'Baixa' },
  { valor: 1, rotulo: 'Média' },
  { valor: 2, rotulo: 'Alta' },
];

const OPCOES_PUBLICO_ALVO = [
  { valor: 0, rotulo: 'Animal' },
  { valor: 1, rotulo: 'Humano e animal' },
];

export function FormularioMedicamento() {
  const navegar = useNavigate();
  const { criar, carregando, erro, errosValidacao } = useMutacaoMedicamento();
  const estilos = useEstilosListagem();
  const sxCampo = estilosCampoFormulario(estilos.cores);

  const [prioridade, setPrioridade] = useState(0);
  const [descricaoMedicamento, setDescricaoMedicamento] = useState('');
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [nfe, setNfe] = useState('');
  const [formula, setFormula] = useState('');
  const [nomeComercial, setNomeComercial] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState(0);
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
      nomeComercial.trim().length > 0 &&
      formula.trim().length > 0 &&
      descricaoMedicamento.trim().length > 0 &&
      lote.trim().length > 0 &&
      dataEntrega.trim().length > 0 &&
      Number.isFinite(quantidade) &&
      quantidade >= 0 &&
      Number.isFinite(nivelMinimoEstoque) &&
      nivelMinimoEstoque >= 0,
    [nomeComercial, formula, descricaoMedicamento, lote, dataEntrega, quantidade, nivelMinimoEstoque],
  );

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido || carregando) return;
    setSubmitErro(false);
    setSubmitSucesso(false);

    const dto: MedicamentoCadastroDto = {
      prioridade,
      descricao: descricaoMedicamento,
      lote,
      quantidade,
      dataEntrega: new Date(dataEntrega).toISOString(),
      nfe,
      formula,
      nomeComercial,
      publicoAlvo,
      dataValidade: dataValidade ? new Date(dataValidade).toISOString() : null,
      nivelMinimoEstoque,
    };

    const ok = await criar(dto);
    if (!ok) {
      setSubmitErro(true);
      setSnackbar({
        open: true,
        message: 'Erro ao criar medicamento. Verifique os dados e tente novamente.',
        severity: 'error',
      });
      return;
    }

    setSubmitSucesso(true);
    setSnackbar({
      open: true,
      message: 'Medicamento criado com sucesso! Redirecionando...',
      severity: 'success',
    });
    window.setTimeout(() => navegar('/medicamentos'), 550);
  }

  return (
    <LayoutFormularioCadastro
      titulo="Novo medicamento"
      subtitulo="Cadastre o medicamento e o lote inicial para controle de estoque e validade."
      rotaVoltar="/medicamentos"
      rotuloVoltar="Voltar para medicamentos"
    >
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />

      <Box component="form" onSubmit={aoEnviar}>
        <SecaoFormularioCadastro titulo="Dados do medicamento">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Nome comercial"
                value={nomeComercial}
                onChange={(e) => setNomeComercial(e.target.value)}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Fórmula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                required
                label="Descrição"
                value={descricaoMedicamento}
                onChange={(e) => setDescricaoMedicamento(e.target.value)}
                multiline
                minRows={2}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={sxCampo}>
                <InputLabel id="prioridade-label">Prioridade</InputLabel>
                <Select
                  labelId="prioridade-label"
                  label="Prioridade"
                  value={prioridade}
                  onChange={(e) => setPrioridade(Number(e.target.value))}
                >
                  {OPCOES_PRIORIDADE.map((opcao) => (
                    <MenuItem key={opcao.valor} value={opcao.valor}>
                      {opcao.rotulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={sxCampo}>
                <InputLabel id="publico-label">Público-alvo</InputLabel>
                <Select
                  labelId="publico-label"
                  label="Público-alvo"
                  value={publicoAlvo}
                  onChange={(e) => setPublicoAlvo(Number(e.target.value))}
                >
                  {OPCOES_PUBLICO_ALVO.map((opcao) => (
                    <MenuItem key={opcao.valor} value={opcao.valor}>
                      {opcao.rotulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </SecaoFormularioCadastro>

        <SecaoFormularioCadastro titulo="Estoque inicial">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
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
          {submitSucesso ? 'Criado com sucesso' : 'Criar medicamento'}
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
