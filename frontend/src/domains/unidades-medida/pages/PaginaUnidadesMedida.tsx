import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';
import {
  atualizarUnidadeMedidaApi,
  criarUnidadeMedidaApi,
  listarUnidadesMedidaApi,
} from '../api/unidadesMedidaApi';
import type { UnidadeMedidaCadastroDto, UnidadeMedidaDto } from '../types/tiposUnidadeMedida';
import { rotuloUnidadeMedida } from '../types/tiposUnidadeMedida';

const ROWS_POR_PAGINA_PADRAO = 10;

const formVazio = (): UnidadeMedidaCadastroDto => ({
  nome: '',
  sigla: '',
  aplicavelProduto: false,
  aplicavelMedicamento: false,
  aplicavelInsumo: false,
  ativa: true,
});

const TIPOS_ITEM = [
  {
    chave: 'aplicavelProduto' as const,
    rotulo: 'Produtos',
    descricao: 'Aparece ao cadastrar produtos',
    icone: <Inventory2OutlinedIcon fontSize="small" />,
    cor: 'primary' as const,
  },
  {
    chave: 'aplicavelMedicamento' as const,
    rotulo: 'Medicamentos',
    descricao: 'Aparece ao cadastrar medicamentos',
    icone: <MedicationOutlinedIcon fontSize="small" />,
    cor: 'secondary' as const,
  },
  {
    chave: 'aplicavelInsumo' as const,
    rotulo: 'Insumos',
    descricao: 'Aparece ao cadastrar insumos',
    icone: <ScienceOutlinedIcon fontSize="small" />,
    cor: 'success' as const,
  },
];

export function PaginaUnidadesMedida() {
  const { cores } = useTemaApp();
  const estilos = useEstilosListagem();
  const [itens, setItens] = useState<UnidadeMedidaDto[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<UnidadeMedidaCadastroDto>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_POR_PAGINA_PADRAO);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setItens(await listarUnidadesMedidaApi({ apenasAtivas: false }));
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itens;
    return itens.filter(
      (i) =>
        i.nome.toLowerCase().includes(termo) ||
        (i.sigla ?? '').toLowerCase().includes(termo),
    );
  }, [itens, busca]);

  useEffect(() => {
    setPage(0);
  }, [busca]);

  const totalCount = filtrados.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage) || 1);
  const pageSegura = Math.min(page, Math.max(0, totalPages - 1));

  const itensPagina = useMemo(() => {
    const inicio = pageSegura * rowsPerPage;
    return filtrados.slice(inicio, inicio + rowsPerPage);
  }, [filtrados, pageSegura, rowsPerPage]);

  useEffect(() => {
    if (page !== pageSegura) setPage(pageSegura);
  }, [page, pageSegura]);

  function abrirNovo() {
    setEditandoId(null);
    setForm(formVazio());
    setErroForm(null);
    setDialogAberto(true);
  }

  function abrirEdicao(item: UnidadeMedidaDto) {
    setEditandoId(item.id);
    setForm({
      nome: item.nome,
      sigla: item.sigla ?? '',
      aplicavelProduto: item.aplicavelProduto,
      aplicavelMedicamento: item.aplicavelMedicamento,
      aplicavelInsumo: item.aplicavelInsumo,
      ativa: item.ativa,
    });
    setErroForm(null);
    setDialogAberto(true);
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErroForm('Informe o nome da unidade de medida (ex.: Quilo, Comprimido).');
      return;
    }
    if (!form.aplicavelProduto && !form.aplicavelMedicamento && !form.aplicavelInsumo) {
      setErroForm('Marque ao menos um tipo de item em que esta medida deve aparecer.');
      return;
    }

    setSalvando(true);
    setErroForm(null);
    try {
      const payload: UnidadeMedidaCadastroDto = {
        ...form,
        nome: form.nome.trim(),
        sigla: form.sigla?.trim() || null,
      };
      if (editandoId == null) await criarUnidadeMedidaApi(payload);
      else await atualizarUnidadeMedidaApi(editandoId, payload);
      setDialogAberto(false);
      await carregar();
    } catch (e) {
      setErroForm(extrairMensagemErroApi(e));
    } finally {
      setSalvando(false);
    }
  }

  function chipsTipos(item: UnidadeMedidaDto) {
    return TIPOS_ITEM.filter((t) => item[t.chave]).map((t) => (
      <Chip
        key={t.chave}
        size="small"
        icon={t.icone}
        label={t.rotulo}
        color={t.cor}
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
    ));
  }

  return (
    <ShellComSidebar
      titulo="Catálogo de unidades de medida"
      subtitulo="Defina como os itens são contados (Kg, Comprimido, Litro…) e em quais cadastros cada medida aparece."
    >
      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${cores.border}`,
            bgcolor: cores.bgCard,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: `${cores.accent}22`,
                  color: cores.chipIcon,
                  flexShrink: 0,
                }}
              >
                <StraightenOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: cores.textPrimary }}>
                  Como funciona
                </Typography>
                <Typography variant="body2" sx={{ color: cores.textSecondary, maxWidth: 640 }}>
                  Exemplo: cadastre <strong>Comprimido</strong> só para medicamentos, e <strong>Kg</strong> para
                  produtos, medicamentos e insumos. Nos formulários de cadastro, cada tipo verá apenas as medidas
                  marcadas para ele.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={abrirNovo}
              sx={{ textTransform: 'none', fontWeight: 800, flexShrink: 0 }}
            >
              Nova unidade de medida
            </Button>
          </Stack>
        </Paper>

        <TextField
          size="small"
          label="Buscar por nome ou sigla"
          placeholder="Ex.: comprimido, kg…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ maxWidth: 360 }}
        />

        <PainelErro mensagem={erro} />

        {carregando ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filtrados.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              border: `1px dashed ${cores.borderForte}`,
              bgcolor: cores.bgCard,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: cores.textPrimary, mb: 0.5 }}>
              {busca.trim() ? 'Nenhuma medida encontrada' : 'Nenhuma unidade de medida cadastrada'}
            </Typography>
            <Typography variant="body2" sx={{ color: cores.textSecondary, mb: 2 }}>
              {busca.trim()
                ? 'Tente outro termo de busca.'
                : 'Comece criando medidas como Unidade, Kg ou Comprimido.'}
            </Typography>
            {!busca.trim() ? (
              <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={abrirNovo} sx={{ textTransform: 'none' }}>
                Cadastrar primeira medida
              </Button>
            ) : null}
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${cores.border}`,
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: cores.bgCard,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                px: 2,
                pt: 1.5,
                color: cores.textMuted,
                fontWeight: 600,
              }}
            >
              {totalCount} {totalCount === 1 ? 'medida' : 'medidas'}
            </Typography>
            <Box sx={{ overflow: 'auto' }}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Unidade de medida</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Disponível no cadastro de</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Situação</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itensPagina.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: cores.textPrimary }}>
                          {rotuloUnidadeMedida(item)}
                        </Typography>
                        {item.sigla ? (
                          <Typography variant="caption" sx={{ color: cores.textMuted }}>
                            Sigla: {item.sigla}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                          {chipsTipos(item)}
                          {!item.aplicavelProduto && !item.aplicavelMedicamento && !item.aplicavelInsumo ? (
                            <Typography variant="caption" sx={{ color: cores.textMuted }}>
                              Nenhum tipo selecionado
                            </Typography>
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.ativa ? 'Ativa (visível nos formulários)' : 'Inativa (oculta nos formulários)'}
                          color={item.ativa ? 'success' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => abrirEdicao(item)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              sx={estilos.paginacao}
              rowsPerPageOptions={[5, 10, 25, 50]}
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={pageSegura}
              onPageChange={(_, novaPagina) => setPage(novaPagina)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number.parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) =>
                count === 0 ? '0–0 de 0' : `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </Paper>
        )}
      </Stack>

      <Dialog open={dialogAberto} onClose={() => !salvando && setDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editandoId == null ? 'Nova unidade de medida' : 'Editar unidade de medida'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {erroForm ? <Alert severity="error">{erroForm}</Alert> : null}

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Identificação
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Nome da medida"
                  placeholder="Ex.: Comprimido, Quilo, Litro"
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  required
                  fullWidth
                  helperText="Nome exibido nos formulários de cadastro."
                />
                <TextField
                  label="Sigla (opcional)"
                  placeholder="Ex.: KG, UN, ml"
                  value={form.sigla ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, sigla: e.target.value }))}
                  fullWidth
                  helperText="Aparece junto ao nome, quando informada."
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                Em quais cadastros esta medida aparece?
              </Typography>
              <Typography variant="body2" sx={{ color: cores.textSecondary, mb: 1 }}>
                Marque os tipos de item que poderão escolher esta unidade ao serem cadastrados.
              </Typography>
              <FormGroup>
                {TIPOS_ITEM.map((t) => (
                  <FormControlLabel
                    key={t.chave}
                    control={
                      <Checkbox
                        checked={form[t.chave]}
                        onChange={(e) => setForm((p) => ({ ...p, [t.chave]: e.target.checked }))}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {t.rotulo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: cores.textSecondary }}>
                          {t.descricao}
                        </Typography>
                      </Box>
                    }
                    sx={{ alignItems: 'flex-start', mb: 0.5 }}
                  />
                ))}
              </FormGroup>
            </Box>

            <FormControlLabel
              control={
                <Checkbox checked={form.ativa} onChange={(e) => setForm((p) => ({ ...p, ativa: e.target.checked }))} />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Medida ativa
                  </Typography>
                  <Typography variant="caption" sx={{ color: cores.textSecondary }}>
                    Se desmarcada, deixa de aparecer nos formulários (itens já cadastrados continuam com a medida).
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogAberto(false)} disabled={salvando} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void salvar()}
            disabled={salvando}
            sx={{ textTransform: 'none', fontWeight: 800 }}
          >
            {salvando ? 'Salvando…' : 'Salvar unidade de medida'}
          </Button>
        </DialogActions>
      </Dialog>
    </ShellComSidebar>
  );
}
