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
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { estilosCampoFormulario } from '../../../shared/theme/estilosCampos';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import {
  type ValorCampoInteiro,
  campoInteiroPositivo,
  inteiroCampoParaEnvio,
  valorCampoInteiroDeInput,
} from '../../../shared/utils/campoInteiroFormulario';
import { listarUsuariosResumoParaRetiradasApi } from '../../usuarios/api/usuariosApi';
import type { UsuarioResumoFiltroDto } from '../../usuarios/types/tiposUsuarios';
import { useMutacaoEstoque } from '../hooks/useEstoque';
import { servicoEstoque } from '../services/servicoEstoque';
import { lerRetiradaNavegacaoDeQuery } from '../utils/retiradaNavegacao';
import type { RetiradaEstoqueDto, RetiradaNavegacaoState, RetiradaRequest } from '../types/tiposEstoque';

export function FormularioRetirada() {
  const navegar = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Item 6: o contexto não depende apenas do location.state; em F5/URL direta é reconstruído pela query string.
  const data = useMemo<RetiradaNavegacaoState | undefined>(() => {
    const viaState = location.state as RetiradaNavegacaoState | undefined;
    if (viaState) return viaState;
    return lerRetiradaNavegacaoDeQuery(searchParams) ?? undefined;
  }, [location.state, searchParams]);
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
  const [erroUsuarios, setErroUsuarios] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [quantidade, setQuantidade] = useState<ValorCampoInteiro>('');
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [confirmarAberto, setConfirmarAberto] = useState(false);
  const [submitSucesso, setSubmitSucesso] = useState(false);
  const [submitErro, setSubmitErro] = useState(false);
  const [saldoAtual, setSaldoAtual] = useState<number | null>(null);
  const [vencidoDialog, setVencidoDialog] = useState<{ aberto: boolean; mensagem: string; dto: RetiradaEstoqueDto | null }>({
    aberto: false,
    mensagem: '',
    dto: null,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Saldo exibido prioriza o valor revalidado no servidor (item 7); cai para o do contexto enquanto carrega.
  const quantidadeDisponivel = saldoAtual ?? data?.quantidadeDisponivel ?? 0;
  const produtoNome = data?.produtoNome.trim() ?? '';
  const destinatarioSelecionado =
    idUsuarioRecebedor != null ? usuariosResumo.find((u) => u.id === idUsuarioRecebedor) ?? null : null;

  useEffect(() => {
    void listarUsuariosResumoParaRetiradasApi()
      .then((usuarios) => {
        setUsuariosResumo(usuarios);
        setErroUsuarios(false);
      })
      .catch(() => {
        setUsuariosResumo([]);
        setErroUsuarios(true);
      });
  }, []);

  // Item 7: revalida o saldo do lote ao abrir a tela, evitando partir de um valor desatualizado.
  useEffect(() => {
    if (!data?.codItem || !data?.loteCodigo) return;
    let ativo = true;
    void servicoEstoque
      .obterSaldoLote(data.codItem, data.loteCodigo)
      .then((item) => {
        if (ativo) setSaldoAtual(item.quantidade);
      })
      .catch(() => {
        // Mantém o saldo do contexto se a consulta falhar; a baixa atômica do backend ainda protege.
      });
    return () => {
      ativo = false;
    };
  }, [data?.codItem, data?.loteCodigo]);

  const retiradaValida = useMemo(() => {
    return Boolean(data) && produtoNome.length > 0 && de.trim().length > 0 && para.trim().length > 0 && campoInteiroPositivo(quantidade) && quantidade <= quantidadeDisponivel;
  }, [data, de, para, produtoNome, quantidade, quantidadeDisponivel]);

  function validarFormulario() {
    if (!data) return 'A retirada deve ser iniciada a partir de um lote na tela de produto.';
    if (!produtoNome) return 'A retirada deve ser iniciada com um produto valido.';
    if (!de.trim()) return 'Informe quem esta retirando.';
    if (!para.trim()) return 'Informe para quem o item sera destinado.';
    if (!campoInteiroPositivo(quantidade)) return 'A quantidade deve ser maior que zero.';
    if (quantidade > quantidadeDisponivel) return 'A quantidade informada é maior que o disponível no lote.';
    return null;
  }

  function aoSucesso() {
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
  }

  async function enviarRetirada(dto: RetiradaEstoqueDto) {
    const resultado = await registrarRetirada(dto);
    if (resultado.ok) {
      aoSucesso();
      return;
    }

    // Item 10: lote vencido -> abre confirmação explícita antes de prosseguir.
    if (resultado.loteVencido) {
      setVencidoDialog({ aberto: true, mensagem: resultado.mensagem, dto });
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

    const qtd = inteiroCampoParaEnvio(quantidade);

    // Item 7: revalida o saldo imediatamente antes de concluir; aborta em caso de divergência.
    try {
      const atual = await servicoEstoque.obterSaldoLote(data!.codItem, data!.loteCodigo);
      setSaldoAtual(atual.quantidade);
      if (qtd > atual.quantidade) {
        setConfirmarAberto(false);
        setSubmitErro(true);
        const msg =
          atual.quantidade <= 0
            ? 'O saldo deste lote foi esgotado. Atualize a tela e tente novamente.'
            : `O saldo do lote mudou para ${atual.quantidade}. Ajuste a quantidade e tente novamente.`;
        setErroValidacao(msg);
        setSnackbar({ open: true, message: msg, severity: 'error' });
        return;
      }
    } catch {
      // Se a consulta de saldo falhar, segue para a baixa (atômica e protegida no backend).
    }

    const payloadRetirada: RetiradaRequest = {
      loteId: data!.loteId,
      quantidade: qtd,
      origem: de,
      destino: para,
    };

    const dto: RetiradaEstoqueDto = {
      codigo: data!.codItem,
      nomeOuDescricaoSimples: produtoNome,
      lote: data!.loteCodigo,
      de: payloadRetirada.origem,
      para: payloadRetirada.destino,
      quantidade: payloadRetirada.quantidade,
      dataHoraRetirada: new Date().toISOString(),
      observacao: observacao.trim() || undefined,
      idUsuarioRecebedor,
    };

    setConfirmarAberto(false);
    await enviarRetirada(dto);
  }

  async function confirmarRetiradaVencida() {
    if (carregando || !vencidoDialog.dto) return;
    const dto = { ...vencidoDialog.dto, confirmarLoteVencido: true };
    setVencidoDialog({ aberto: false, mensagem: '', dto: null });
    await enviarRetirada(dto);
  }

  if (!data || !produtoNome) {
    return (
      <Box sx={{ width: '100%', maxWidth: 600, p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {!data ? 'Dados da retirada nao foram informados.' : 'Dados da retirada estao incompletos: produto sem nome.'}
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

          {erroUsuarios && (
            <Alert severity="warning">
              Não foi possível carregar a lista de usuários cadastrados. Informe o destinatário manualmente no campo
              "Para quem".
            </Alert>
          )}

          <TextField label="Produto" value={produtoNome} disabled fullWidth sx={sxCampo} />
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
            onChange={(e) => setQuantidade(valorCampoInteiroDeInput(e.target.value))}
            slotProps={{ htmlInput: { min: 1, max: quantidadeDisponivel } }}
            required
            fullWidth
            error={Boolean(erroValidacao) && (!campoInteiroPositivo(quantidade) || quantidade > quantidadeDisponivel)}
            helperText={
              Boolean(erroValidacao) && campoInteiroPositivo(quantidade) && quantidade > quantidadeDisponivel
                ? 'A quantidade informada é maior que o disponível no lote'
                : Boolean(erroValidacao) && !campoInteiroPositivo(quantidade)
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
            Confirma a retirada de {campoInteiroPositivo(quantidade) ? quantidade : ''} unidade(s) do lote {data.loteCodigo}?
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

      <Dialog
        open={vencidoDialog.aberto}
        onClose={() => setVencidoDialog({ aberto: false, mensagem: '', dto: null })}
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
        <DialogTitle sx={{ color: cores.textPrimary, fontWeight: 700 }}>Lote vencido</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            {vencidoDialog.mensagem || 'O lote selecionado está vencido.'}
          </Typography>
          <Typography variant="body2" sx={{ color: cores.textSecondary, mt: 1 }}>
            A retirada ficará registrada no histórico como autorizada por você, com a data de vencimento do lote.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setVencidoDialog({ aberto: false, mensagem: '', dto: null })}
            sx={{ color: cores.textMuted, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <LoadingButton
            loading={carregando}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="contained"
            color="warning"
            onClick={confirmarRetiradaVencida}
            disabled={carregando}
            sx={estilos.botaoPrimario}
          >
            Retirar mesmo assim
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
