import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { PERMISSAO } from '../../../shared/constants/permissoesCodigos';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { podeGerenciarCatalogoPermissoes } from '../../../shared/utils/possuiPermissao';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { servicoPermissoes } from '../services/servicoPermissoes';
import type { PermissaoLeituraDto } from '../types/tiposPermissoes';

const formularioVazio = {
  codigo: '',
  nome: '',
  descricao: '',
  categoria: 'Personalizada',
  escopoUnidadeEstoque: false,
};

export function PaginaCatalogoPermissoes() {
  const { cores } = useTemaApp();
  const { usuario } = useAutenticacao();
  const podeGerenciar = podeGerenciarCatalogoPermissoes(usuario);

  const [lista, setLista] = useState<PermissaoLeituraDto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState(formularioVazio);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setLista(await servicoPermissoes.listar());
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const agrupadas = useMemo(() => {
    const mapa = new Map<string, PermissaoLeituraDto[]>();
    for (const item of lista) {
      const chave = item.categoria || 'Outros';
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave)!.push(item);
    }
    return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [lista]);

  async function salvarNova() {
    setSalvando(true);
    setErro(null);
    try {
      await servicoPermissoes.criar({
        codigo: form.codigo,
        nome: form.nome,
        descricao: form.descricao || null,
        categoria: form.categoria,
        escopoUnidadeEstoque: form.escopoUnidadeEstoque,
      });
      setDialogAberto(false);
      setForm(formularioVazio);
      await carregar();
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ShellComSidebar
      titulo="Catálogo de permissões"
      subtitulo="Permissões globais e por unidade (Secretaria / Canil). Apenas administradores podem criar novas entradas."
    >
      <Stack spacing={2}>
        {erro ? <Alert severity="error">{erro}</Alert> : null}

        {podeGerenciar ? (
          <Box>
            <Button variant="contained" onClick={() => setDialogAberto(true)}>
              Nova permissão
            </Button>
          </Box>
        ) : (
          <Alert severity="info">
            Você pode visualizar o catálogo. Para criar permissões, é necessário{' '}
            <strong>{PERMISSAO.permissoesCatalogoGerenciar}</strong>.
          </Alert>
        )}

        {carregando ? (
          <Stack direction="row" spacing={1.5} sx={{ py: 4, justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          agrupadas.map(([categoria, itens]) => (
            <Card key={categoria} sx={{ borderRadius: 3, border: `1px solid ${cores.border}` }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  {categoria}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Escopo</TableCell>
                      <TableCell>Tipo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itens.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {p.codigo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {p.nome}
                          </Typography>
                          {p.descricao ? (
                            <Typography variant="caption" color="text.secondary">
                              {p.descricao}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {p.escopoUnidadeEstoque ? 'Secretaria / Canil' : 'Global'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={p.ehSistema ? 'Sistema' : 'Personalizada'}
                            color={p.ehSistema ? 'default' : 'primary'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      <Dialog open={dialogAberto} onClose={salvando ? undefined : () => setDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova permissão</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Código"
              helperText="Ex.: relatorios.exportar (minúsculas, sem espaços)"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Categoria"
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.escopoUnidadeEstoque}
                  onChange={(e) => setForm((f) => ({ ...f, escopoUnidadeEstoque: e.target.checked }))}
                />
              }
              label="Escopo por unidade de estoque (Secretaria / Canil)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={salvando || !form.codigo.trim() || !form.nome.trim()}
            onClick={() => void salvarNova()}
          >
            {salvando ? 'Salvando…' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </ShellComSidebar>
  );
}
