import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { PainelErro } from '../../../shared/components/PainelErro';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import type { PermissaoAtribuicaoLinhaDto } from '../../permissoes/types/tiposPermissoes';
import type { UsuarioCriadoDto } from '../types/tiposUsuarios';
import { usuariosService } from '../services/usuariosService';

function chaveLinha(linha: Pick<PermissaoAtribuicaoLinhaDto, 'idPermissao' | 'idUnidadeEstoque'>): string {
  return `${linha.idPermissao}:${linha.idUnidadeEstoque ?? 'global'}`;
}

function mapaInicial(linhas: PermissaoAtribuicaoLinhaDto[]): Record<string, boolean> {
  const mapa: Record<string, boolean> = {};
  for (const linha of linhas) {
    mapa[chaveLinha(linha)] = linha.atribuida;
  }
  return mapa;
}

type Props = {
  usuario: UsuarioCriadoDto;
  aoSalvar?: () => void;
};

export function FormularioAtribuicaoPermissoesUsuario({ usuario, aoSalvar }: Props) {
  const { cores } = useTemaApp();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<PermissaoAtribuicaoLinhaDto[]>([]);
  const [atribuidas, setAtribuidas] = useState<Record<string, boolean>>({});

  const carregar = useCallback(async () => {
    if (!usuario.id) return;
    setCarregando(true);
    setErro(null);
    setSucesso(null);
    try {
      const editor = await usuariosService.obterPermissoesAtribuicoes(usuario.id);
      setLinhas(editor.linhas);
      setAtribuidas(mapaInicial(editor.linhas));
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      setLinhas([]);
      setAtribuidas({});
    } finally {
      setCarregando(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const nomeExibicao = useMemo(
    () => `${usuario.primeiroNome} ${usuario.sobrenome ?? ''}`.trim(),
    [usuario.primeiroNome, usuario.sobrenome],
  );

  const unidades = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const linha of linhas) {
      if (linha.escopoUnidadeEstoque && linha.idUnidadeEstoque != null && linha.nomeUnidade) {
        mapa.set(linha.idUnidadeEstoque, linha.nomeUnidade);
      }
    }
    return [...mapa.entries()].sort(([a], [b]) => a - b);
  }, [linhas]);

  const categorias = useMemo(() => {
    const mapa = new Map<string, PermissaoAtribuicaoLinhaDto[]>();
    for (const linha of linhas) {
      const cat = linha.categoria || 'Outros';
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat)!.push(linha);
    }
    return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [linhas]);

  function alternar(chave: string, valor: boolean) {
    setAtribuidas((atual) => ({ ...atual, [chave]: valor }));
    setSucesso(null);
  }

  async function salvar() {
    if (!usuario.id) return;
    setSalvando(true);
    setErro(null);
    setSucesso(null);
    try {
      const atribuicoes = linhas
        .filter((linha) => atribuidas[chaveLinha(linha)])
        .map((linha) => ({
          idPermissao: linha.idPermissao,
          idUnidadeEstoque: linha.escopoUnidadeEstoque ? linha.idUnidadeEstoque : null,
        }));

      await usuariosService.salvarPermissoesAtribuicoes(usuario.id, { atribuicoes });
      setSucesso('Permissões atribuídas com sucesso. O usuário precisará entrar novamente para aplicar as mudanças.');
      aoSalvar?.();
      await carregar();
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ color: cores.textSecondary }}>
          Carregando permissões…
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cores.textPrimary }}>
          {nomeExibicao}
        </Typography>
        <Typography variant="body2" sx={{ color: cores.textSecondary }}>
          {usuario.email}
        </Typography>
      </Box>

      <Alert severity="info">
        Marque as permissões que este usuário deve ter. Permissões globais valem em todo o sistema; as demais
        podem ser definidas separadamente para Secretaria e Canil. Ao salvar, a lista completa é substituída e a
        sessão do usuário é invalidada.
      </Alert>

      {categorias.map(([categoria, itensCategoria]) => {
        const globais = itensCategoria.filter((l) => !l.escopoUnidadeEstoque);
        const porPermissao = new Map<
          number,
          { linha: PermissaoAtribuicaoLinhaDto; unidades: PermissaoAtribuicaoLinhaDto[] }
        >();

        for (const linha of itensCategoria.filter((l) => l.escopoUnidadeEstoque)) {
          if (!porPermissao.has(linha.idPermissao)) {
            porPermissao.set(linha.idPermissao, { linha, unidades: [] });
          }
          porPermissao.get(linha.idPermissao)!.unidades.push(linha);
        }

        const linhasUnidade = [...porPermissao.values()];

        if (globais.length === 0 && linhasUnidade.length === 0) return null;

        return (
          <Paper
            key={categoria}
            variant="outlined"
            sx={{ borderColor: cores.border, borderRadius: 2, p: 2, bgcolor: cores.bgCard }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: cores.textPrimary, mb: 1.5 }}>
              {categoria}
            </Typography>

            {globais.length > 0 ? (
              <Stack spacing={0.5} sx={{ mb: linhasUnidade.length > 0 ? 2 : 0 }}>
                {globais.map((linha) => {
                  const chave = chaveLinha(linha);
                  return (
                    <FormControlLabel
                      key={chave}
                      control={
                        <Checkbox
                          checked={Boolean(atribuidas[chave])}
                          onChange={(e) => alternar(chave, e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                              {linha.nome}
                            </Typography>
                            <Chip size="small" label={linha.codigo} sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                            {linha.ehSistema ? (
                              <Chip size="small" label="Sistema" variant="outlined" />
                            ) : null}
                          </Stack>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', m: 0 }}
                    />
                  );
                })}
              </Stack>
            ) : null}

            {linhasUnidade.length > 0 ? (
              <Box sx={{ overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Permissão</TableCell>
                      {unidades.map(([id, nome]) => (
                        <TableCell key={id} align="center">
                          {nome}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {linhasUnidade.map(({ linha, unidades: linhasUnid }) => (
                      <TableRow key={linha.idPermissao}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                            {linha.nome}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                            <Chip
                              size="small"
                              label={linha.codigo}
                              sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}
                            />
                            {linha.ehSistema ? (
                              <Chip size="small" label="Sistema" variant="outlined" />
                            ) : null}
                          </Stack>
                        </TableCell>
                        {unidades.map(([idUnidade]) => {
                          const linhaUnidade = linhasUnid.find((l) => l.idUnidadeEstoque === idUnidade);
                          if (!linhaUnidade) {
                            return (
                              <TableCell key={idUnidade} align="center">
                                —
                              </TableCell>
                            );
                          }
                          const chave = chaveLinha(linhaUnidade);
                          return (
                            <TableCell key={idUnidade} align="center">
                              <Checkbox
                                size="small"
                                checked={Boolean(atribuidas[chave])}
                                onChange={(e) => alternar(chave, e.target.checked)}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : null}
          </Paper>
        );
      })}

      <PainelErro mensagem={erro} />
      {sucesso ? (
        <Typography variant="body2" sx={{ color: cores.accent }}>
          {sucesso}
        </Typography>
      ) : null}

      <Box>
        <Button
          variant="contained"
          disabled={salvando || linhas.length === 0}
          onClick={() => void salvar()}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          {salvando ? 'Salvando…' : 'Salvar atribuições'}
        </Button>
      </Box>
    </Stack>
  );
}
