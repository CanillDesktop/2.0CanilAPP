import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import { listarUsuariosResumoParaRetiradasApi } from '../../usuarios/api/usuariosApi';
import type { UsuarioResumoFiltroDto } from '../../usuarios/types/tiposUsuarios';
import { useMutacaoEstoque } from '../hooks/useEstoque';
import type { RetiradaEstoqueDto, RetiradaNavegacaoState, RetiradaRequest } from '../types/tiposEstoque';

export function FormularioRetirada() {
  const navegar = useNavigate();
  const location = useLocation();
  const data = location.state as RetiradaNavegacaoState | undefined;
  const { registrarRetirada, carregando, erro } = useMutacaoEstoque();
  const { cores } = useTemaApp();
  const estilos = useEstilosListagem();
  const sxCampo = {
    ...estilosCampoFormulario(cores),
    mb: 2,
    '& .MuiInputBase-input.Mui-disabled': {
      color: cores.textSecondary,
      WebkitTextFillColor: cores.textSecondary,
    },
    '& .MuiOutlinedInput-root.Mui-disabled': {
      backgroundColor: cores.hoverSurface,
    },
  };

  const [de, setDe] = useState('');
  const [para, setPara] = useState('');
  const [idUsuarioRecebedor, setIdUsuarioRecebedor] = useState<number | undefined>();
  const [usuariosResumo, setUsuariosResumo] = useState<UsuarioResumoFiltroDto[]>([]);
  const [observacao, setObservacao] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [confirmarAberto, setConfirmarAberto] = useState(false);
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

  const quantidadeDisponivel = data?.quantidadeDisponivel ?? 0;
  const destinatarioSelecionado =
    idUsuarioRecebedor != null ? usuariosResumo.find((u) => u.id === idUsuarioRecebedor) ?? null : null;

  useEffect(() => {
    void listarUsuariosResumoParaRetiradasApi()
      .then(setUsuariosResumo)
      .catch(() => setUsuariosResumo([]));
  }, []);

  const retiradaValida = useMemo(() => {
    return Boolean(data) && de.trim().length > 0 && para.trim().length > 0 && quantidade > 0 && quantidade <= quantidadeDisponivel;
  }, [data, de, para, quantidade, quantidadeDisponivel]);

  function validarFormulario() {
    if (!data) return 'A retirada deve ser iniciada a partir de um lote na tela de produto.';
    if (!de.trim()) return 'Informe quem está retirando.';
    if (!para.trim()) return 'Informe para quem o item será destinado.';
    if (!Number.isFinite(quantidade) || quantidade <= 0) return 'A quantidade deve ser maior que zero.';
    if (quantidade > quantidadeDisponivel) return 'A quantidade informada é maior que o disponível no lote.';
    return null;
  }

  async function confirmarRetirada() {
    if (carregando) return;
    const validacao = validarFormulario();
    if (validacao) {
      setErroValidacao(validacao);
      setConfirmarAberto(false);
      setSubmitErro(true);
      setSnackbar({
        open: true,
        message: validacao,
        severity: 'error',
      });
      return;
    }

    const payloadRetirada: RetiradaRequest = {
      loteId: data!.loteId,
      quantidade,
      origem: de,
      destino: para,
    };

    const dto: RetiradaEstoqueDto = {
      codigo: data!.codItem,
      nomeOuDescricaoSimples: data!.produtoNome,
      lote: data!.loteCodigo,
      de: payloadRetirada.origem,
      para: payloadRetirada.destino,
      quantidade: payloadRetirada.quantidade,
      dataHoraRetirada: new Date().toISOString(),
      observacao: observacao.trim() || undefined,
      idUsuarioRecebedor: idUsuarioRecebedor,
    };

    const resultado = await registrarRetirada(dto);
    setConfirmarAberto(false);
    if (resultado.ok) {
      setSubmitSucesso(true);
      setSubmitErro(false);
      setSnackbar({
        open: true,
        message: 'Retirada realizada com sucesso.',
        severity: 'success',
      });
      window.setTimeout(() => {
        if (data?.retornoRota) navegar(`${data.retornoRota}?refresh=${Date.now()}`);
        else navegar(-1);
      }, 850);
      return;
    }
    setSubmitErro(true);
    setSubmitSucesso(false);
    setSnackbar({
      open: true,
      message: resultado.mensagem,
      severity: 'error',
    });
  }

  if (!data) {
    return (
      <Box sx={{ width: '100%', maxWidth: 600, p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Não encontramos os dados desta retirada. Inicie o processo a partir de um lote na ficha do item.
        </Alert>
        <Button variant="contained" onClick={() => navegar('/produtos')} sx={estilos.botaoPrimario}>
          Voltar para produtos
        </Button>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 600,
        p: 1,
        borderRadius: 3,
        border: `1px solid ${cores.border}`,
        backgroundColor: cores.bgCard,
        boxShadow: cores.sombraCard,
      }}
    >
      <CardContent>
        <Stack sx={{ gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: cores.textPrimary }}>
              Registrar retirada
            </Typography>
            <Button onClick={() => navegar(-1)} sx={{ color: cores.textMuted, textTransform: 'none' }}>
              Voltar
            </Button>
          </Box>

          {(erro || erroValidacao) && <Alert severity="error">{erroValidacao ?? erro}</Alert>}

          <TextField label="Produto" value={data.produtoNome} disabled fullWidth sx={sxCampo} />
          <TextField label="Lote" value={data.loteCodigo} disabled fullWidth sx={sxCampo} />
          <TextField label="Quantidade disponível" value={String(quantidadeDisponivel)} disabled fullWidth sx={sxCampo} />

          <TextField
            label="Quem está retirando"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            required
            fullWidth
            error={!de.trim() && Boolean(erroValidacao)}
            helperText={!de.trim() && Boolean(erroValidacao) ? 'Campo obrigatório' : ' '}
            sx={sxCampo}
          />

          <Autocomplete
            options={usuariosResumo}
            getOptionLabel={(o) => o.nomeExibicao}
            value={destinatarioSelecionado}
            onChange={(_, v) => {
              setIdUsuarioRecebedor(v?.id);
              if (v) setPara(v.nomeExibicao);
            }}
            slotProps={{
              paper: { sx: { bgcolor: cores.bgCard, border: `1px solid ${cores.border}` } },
            }}
            renderInput={(params) => (
              <TextField {...params} label="Destinatário cadastrado (opcional)" sx={sxCampo} />
            )}
          />

          <TextField
            label="Para quem"
            value={para}
            onChange={(e) => {
              setPara(e.target.value);
              setIdUsuarioRecebedor(undefined);
            }}
            required
            fullWidth
            error={!para.trim() && Boolean(erroValidacao)}
            helperText={!para.trim() && Boolean(erroValidacao) ? 'Campo obrigatório' : ' '}
            sx={sxCampo}
          />
          <TextField
            label="Quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 1, max: quantidadeDisponivel } }}
            required
            fullWidth
            error={Boolean(erroValidacao) && (!Number.isFinite(quantidade) || quantidade <= 0 || quantidade > quantidadeDisponivel)}
            helperText={
              Boolean(erroValidacao) && quantidade > quantidadeDisponivel
                ? 'A quantidade informada é maior que o disponível no lote'
                : Boolean(erroValidacao) && quantidade <= 0
                  ? 'Quantidade deve ser maior que zero'
                  : ' '
            }
            sx={sxCampo}
          />

          <TextField
            label="Observação / motivo"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={sxCampo}
          />

          <Box sx={{ display: 'flex' }}>
            <LoadingButton
              loading={carregando}
              loadingPosition="start"
              startIcon={submitSucesso ? <CheckIcon /> : <SaveIcon />}
              color={submitSucesso ? 'success' : submitErro ? 'error' : 'primary'}
              variant="contained"
              fullWidth
              size="large"
              onClick={() => {
                if (carregando) return;
                const validacao = validarFormulario();
                if (validacao) {
                  setErroValidacao(validacao);
                  setSubmitErro(true);
                  return;
                }
                setErroValidacao(null);
                setSubmitErro(false);
                setConfirmarAberto(true);
              }}
              disabled={!retiradaValida || carregando}
              sx={{ ...estilos.botaoPrimario, mt: 1 }}
            >
              {submitSucesso ? 'Retirada confirmada' : 'Confirmar retirada'}
            </LoadingButton>
          </Box>
        </Stack>
      </CardContent>

      <Dialog
        open={confirmarAberto}
        onClose={() => setConfirmarAberto(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: cores.bgCard,
              color: cores.textPrimary,
              border: `1px solid ${cores.border}`,
            },
          },
        }}
      >
        <DialogTitle sx={{ color: cores.textPrimary, fontWeight: 700 }}>Confirmar retirada</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            Confirma a retirada de {quantidade} unidade(s) do lote {data.loteCodigo}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarAberto(false)} sx={{ color: cores.textMuted, textTransform: 'none' }}>
            Cancelar
          </Button>
          <LoadingButton
            loading={carregando}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={confirmarRetirada}
            disabled={carregando}
            sx={estilos.botaoPrimario}
          >
            Confirmar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((estado) => ({ ...estado, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((estado) => ({ ...estado, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}
