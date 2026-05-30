import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutFormularioCadastro, SecaoFormularioCadastro } from '../../../shared/components/LayoutFormularioCadastro';
import { PainelErro } from '../../../shared/components/PainelErro';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { OPCOES_CATEGORIA_PRODUTO_FILTRO } from '../constants/opcoesCategoriaProduto';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import type { ProdutoCadastroDto } from '../types/tiposProdutos';

const OPCOES_UNIDADE = [
  { valor: 1, rotulo: 'Unidade' },
  { valor: 2, rotulo: 'Kg' },
  { valor: 3, rotulo: 'Litro' },
];

export function FormularioProduto() {
  const navegar = useNavigate();
  const { criar, carregando, erro, errosValidacao } = useMutacaoProduto();
  const estilos = useEstilosListagem();
  const sxCampo = estilosCampoFormulario(estilos.cores);

  const [descricaoSimples, setDescricaoSimples] = useState('');
  const [descricaoDetalhada, setDescricaoDetalhada] = useState('');
  const [unidade, setUnidade] = useState(1);
  const [categoria, setCategoria] = useState(1);
  const [cadastrarEstoqueInicial, setCadastrarEstoqueInicial] = useState(true);
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [nfe, setNfe] = useState('');
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

  const formularioValido = useMemo(() => {
    const baseValida =
      descricaoSimples.trim().length > 0 &&
      Number.isFinite(unidade) &&
      unidade > 0 &&
      Number.isFinite(categoria) &&
      categoria > 0 &&
      Number.isFinite(nivelMinimoEstoque) &&
      nivelMinimoEstoque >= 0;

    if (!cadastrarEstoqueInicial) return baseValida;

    return (
      baseValida &&
      lote.trim().length > 0 &&
      Number.isFinite(quantidade) &&
      quantidade > 0 &&
      dataEntrega.trim().length > 0
    );
  }, [descricaoSimples, unidade, categoria, nivelMinimoEstoque, cadastrarEstoqueInicial, lote, quantidade, dataEntrega]);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!formularioValido || carregando) return;
    setSubmitErro(false);
    setSubmitSucesso(false);

    const dto: ProdutoCadastroDto = {
      descricaoSimples,
      descricaoDetalhada,
      unidade,
      categoria,
      lote: cadastrarEstoqueInicial ? lote : null,
      quantidade: cadastrarEstoqueInicial ? quantidade : 0,
      dataEntrega: new Date(dataEntrega).toISOString(),
      nfe,
      dataValidade: dataValidade ? new Date(dataValidade).toISOString() : null,
      nivelMinimoEstoque,
    };

    const ok = await criar(dto);
    if (!ok) {
      setSubmitErro(true);
      setSnackbar({
        open: true,
        message: 'Erro ao criar produto. Verifique os dados e tente novamente.',
        severity: 'error',
      });
      return;
    }

    setSubmitSucesso(true);
    setSnackbar({
      open: true,
      message: 'Produto criado com sucesso! Redirecionando...',
      severity: 'success',
    });
    window.setTimeout(() => navegar('/produtos'), 550);
  }

  return (
    <LayoutFormularioCadastro
      titulo="Novo produto"
      subtitulo="Preencha os dados essenciais e, se necessário, já registre o estoque inicial."
      rotaVoltar="/produtos"
      rotuloVoltar="Voltar para produtos"
    >
      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />

      <Box component="form" onSubmit={aoEnviar}>
        <SecaoFormularioCadastro titulo="Dados do produto">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Nome / descrição simples"
                value={descricaoSimples}
                onChange={(e) => setDescricaoSimples(e.target.value)}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Descrição detalhada"
                value={descricaoDetalhada}
                onChange={(e) => setDescricaoDetalhada(e.target.value)}
                multiline
                minRows={3}
                sx={sxCampo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={sxCampo}>
                <InputLabel id="categoria-label">Categoria</InputLabel>
                <Select
                  labelId="categoria-label"
                  label="Categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(Number(e.target.value))}
                >
                  {OPCOES_CATEGORIA_PRODUTO_FILTRO.map((opcao) => (
                    <MenuItem key={opcao.valor} value={opcao.valor}>
                      {opcao.rotulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          </Grid>
        </SecaoFormularioCadastro>

        <SecaoFormularioCadastro
          titulo="Estoque inicial"
          acaoCabecalho={
            <FormControlLabel
              control={
                <Switch
                  checked={cadastrarEstoqueInicial}
                  onChange={(e) => setCadastrarEstoqueInicial(e.target.checked)}
                />
              }
              label="Cadastrar estoque inicial"
              sx={{ color: estilos.cores.textPrimary, m: 0 }}
            />
          }
        >
          <Collapse in={cadastrarEstoqueInicial}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required={cadastrarEstoqueInicial}
                  label="Lote inicial"
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                  sx={sxCampo}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required={cadastrarEstoqueInicial}
                  type="number"
                  label="Quantidade inicial"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  slotProps={{ htmlInput: { min: 1 } }}
                  sx={sxCampo}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required={cadastrarEstoqueInicial}
                  type="date"
                  label="Data de entrada"
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
                  label="Documento (NF)"
                  value={nfe}
                  onChange={(e) => setNfe(e.target.value)}
                  sx={sxCampo}
                />
              </Grid>
            </Grid>
          </Collapse>
          {!cadastrarEstoqueInicial ? (
            <Typography variant="body2" sx={{ color: estilos.cores.textMuted }}>
              O produto será criado sem lote inicial. Você poderá registrar estoque depois na ficha do item.
            </Typography>
          ) : null}
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
          {submitSucesso ? 'Criado com sucesso' : 'Criar produto'}
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
