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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { podeGerenciarCargos } from '../../../shared/utils/possuiPermissao';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { FormularioCargoPermissoes } from '../components/FormularioCargoPermissoes';
import { servicoCargos } from '../services/servicoCargos';
import type { CargoLeituraDto } from '../types/tiposCargos';

export function PaginaCatalogoCargos() {
  const { cores } = useTemaApp();
  const { usuario } = useAutenticacao();
  const podeGerenciar = podeGerenciarCargos(usuario);

  const [lista, setLista] = useState<CargoLeituraDto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [cargoPermissoesId, setCargoPermissoesId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setLista(await servicoCargos.listar());
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function criarCargo() {
    setSalvando(true);
    setErro(null);
    try {
      await servicoCargos.criar({ nome: nome.trim(), descricao: descricao.trim() || null });
      setDialogAberto(false);
      setNome('');
      setDescricao('');
      await carregar();
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ShellComSidebar
      titulo="Cargos"
      subtitulo="Perfis personalizáveis com conjuntos de permissões. O cargo Administrador possui acesso total."
    >
      <Stack spacing={2}>
        {erro ? <Alert severity="error">{erro}</Alert> : null}

        {podeGerenciar ? (
          <Box>
            <Button variant="contained" onClick={() => setDialogAberto(true)}>
              Novo cargo
            </Button>
          </Box>
        ) : (
          <Alert severity="info">Você pode visualizar os cargos. Para criar ou editar, é necessário cargos.gerenciar.</Alert>
        )}

        {carregando ? (
          <Stack direction="row" spacing={1.5} sx={{ py: 4, justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Card sx={{ borderRadius: 3, border: `1px solid ${cores.border}` }}>
            <CardContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cargo</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Usuários</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lista.map((cargo) => (
                    <TableRow key={cargo.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {cargo.nome}
                        </Typography>
                      </TableCell>
                      <TableCell>{cargo.descricao ?? '—'}</TableCell>
                      <TableCell>{cargo.totalUsuarios}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={cargo.ehSistema ? 'Sistema' : 'Personalizado'}
                          variant={cargo.ehSistema ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {podeGerenciar && !cargo.ehAdministradorSistema ? (
                          <Button size="small" onClick={() => setCargoPermissoesId(cargo.id)}>
                            Permissões
                          </Button>
                        ) : cargo.ehAdministradorSistema ? (
                          <Typography variant="caption" color="text.secondary">
                            Todas as permissões
                          </Typography>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Typography variant="body2" color="text.secondary">
          Atribua cargos aos usuários em{' '}
          <Box component={Link} to="/usuarios" sx={{ color: cores.focus, fontWeight: 600 }}>
            Usuários
          </Box>
          . Permissões de estoque por unidade continuam na aba &quot;Unidade de estoque&quot;.
        </Typography>
      </Stack>

      <Dialog open={dialogAberto} onClose={salvando ? undefined : () => setDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo cargo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth />
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button variant="contained" disabled={salvando || nome.trim().length < 2} onClick={() => void criarCargo()}>
            {salvando ? 'Criando…' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cargoPermissoesId != null}
        onClose={() => setCargoPermissoesId(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Permissões do cargo</DialogTitle>
        <DialogContent>
          {cargoPermissoesId != null ? (
            <FormularioCargoPermissoes
              idCargo={cargoPermissoesId}
              aoSalvar={() => void carregar()}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCargoPermissoesId(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </ShellComSidebar>
  );
}
