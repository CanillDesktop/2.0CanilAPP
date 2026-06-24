import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { useUnidadeEstoque } from '../../../app/providers/ContextoUnidadeEstoque';
import { ShellComSidebar } from '../../../shared/components/ShellComSidebar';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useTransferenciasEstoque } from '../hooks/useTransferencias';

export function PaginaListagemTransferencias() {
  const { cores } = useTemaApp();
  const { permissoesAtivas } = useUnidadeEstoque();
  const navegar = useNavigate();
  const { lista, carregando, salvando, erro, carregar, receber } = useTransferenciasEstoque();

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function confirmarRecebimento(id: number) {
    const ok = await receber(id);
    if (ok.ok) void carregar();
  }

  return (
    <ShellComSidebar titulo="Transferências" subtitulo="Envio e recebimento de estoque entre Secretaria e Canil">
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          {permissoesAtivas?.podeTransferirEnviar ? (
            <Button variant="contained" component={Link} to="/estoque/transferencias/nova">
              Nova transferência
            </Button>
          ) : null}
        </Stack>

        <PainelErro mensagem={erro} />

        {carregando ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" sx={{ color: cores.textSecondary }}>
              Carregando transferências…
            </Typography>
          </Stack>
        ) : lista.length === 0 ? (
          <Alert severity="info">Nenhuma transferência registrada.</Alert>
        ) : (
          <Card sx={{ borderRadius: 3, bgcolor: cores.bgCard, border: `1px solid ${cores.border}` }}>
            <CardContent sx={{ overflow: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Origem → Destino</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Itens</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lista.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>
                        {t.unidadeOrigemNome} → {t.unidadeDestinoNome}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={t.status} />
                      </TableCell>
                      <TableCell>{new Date(t.dataTransferencia).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        {t.itens.map((i) => (
                          <Typography key={`${i.idItem}-${i.lote}`} variant="caption" sx={{ display: 'block' }}>
                            {i.nomeItem} ({i.lote}) × {i.quantidade}
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell align="right">
                        {t.status.toLowerCase().includes('pend') && permissoesAtivas?.podeTransferirReceber ? (
                          <Button size="small" disabled={salvando} onClick={() => void confirmarRecebimento(t.id)}>
                            Receber
                          </Button>
                        ) : (
                          <Button size="small" onClick={() => navegar(`/estoque/transferencias`)}>
                            Detalhes
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Stack>
    </ShellComSidebar>
  );
}
