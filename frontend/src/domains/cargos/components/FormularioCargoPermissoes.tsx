import {
  Alert,
  Button,
  Checkbox,
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
import { servicoCargos } from '../services/servicoCargos';
import type { CargoPermissaoAtribuicaoLinhaDto } from '../types/tiposCargos';

function chaveLinha(linha: Pick<CargoPermissaoAtribuicaoLinhaDto, 'idPermissao' | 'idUnidadeEstoque'>): string {
  return `${linha.idPermissao}:${linha.idUnidadeEstoque ?? 'global'}`;
}

type Props = {
  idCargo: number;
  aoSalvar?: () => void;
};

export function FormularioCargoPermissoes({ idCargo, aoSalvar }: Props) {
  const { cores } = useTemaApp();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [nomeCargo, setNomeCargo] = useState('');
  const [ehAdmin, setEhAdmin] = useState(false);
  const [linhas, setLinhas] = useState<CargoPermissaoAtribuicaoLinhaDto[]>([]);
  const [atribuidas, setAtribuidas] = useState<Record<string, boolean>>({});

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    setSucesso(null);
    try {
      const editor = await servicoCargos.obterPermissoes(idCargo);
      setNomeCargo(editor.nomeCargo);
      setEhAdmin(editor.ehAdministradorSistema);
      setLinhas(editor.linhas);
      const mapa: Record<string, boolean> = {};
      for (const linha of editor.linhas) mapa[chaveLinha(linha)] = linha.atribuida;
      setAtribuidas(mapa);
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
    } finally {
      setCarregando(false);
    }
  }, [idCargo]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

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
    const mapa = new Map<string, CargoPermissaoAtribuicaoLinhaDto[]>();
    for (const linha of linhas) {
      const cat = linha.categoria || 'Outros';
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat)!.push(linha);
    }
    return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [linhas]);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      const atribuicoes = linhas
        .filter((linha) => atribuidas[chaveLinha(linha)])
        .map((linha) => ({
          idPermissao: linha.idPermissao,
          idUnidadeEstoque: linha.escopoUnidadeEstoque ? linha.idUnidadeEstoque : null,
        }));
      await servicoCargos.salvarPermissoes(idCargo, { atribuicoes });
      setSucesso('Permissões do cargo salvas. Usuários com este cargo precisarão entrar novamente.');
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
        <Typography variant="body2">Carregando…</Typography>
      </Stack>
    );
  }

  if (ehAdmin) {
    return (
      <Alert severity="info">
        O cargo <strong>{nomeCargo}</strong> é administrador e possui automaticamente todas as permissões do sistema.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {nomeCargo}
      </Typography>
      <Alert severity="info">
        Defina o que usuários com este cargo podem fazer. Permissões de estoque por unidade exigem também o vínculo
        Secretaria/Canil na ficha do usuário.
      </Alert>

      {categorias.map(([categoria, itens]) => {
        const globais = itens.filter((l) => !l.escopoUnidadeEstoque);
        const porPermissao = new Map<number, { linha: CargoPermissaoAtribuicaoLinhaDto; unidades: CargoPermissaoAtribuicaoLinhaDto[] }>();
        for (const linha of itens.filter((l) => l.escopoUnidadeEstoque)) {
          if (!porPermissao.has(linha.idPermissao)) porPermissao.set(linha.idPermissao, { linha, unidades: [] });
          porPermissao.get(linha.idPermissao)!.unidades.push(linha);
        }
        const linhasUnidade = [...porPermissao.values()];
        if (globais.length === 0 && linhasUnidade.length === 0) return null;

        return (
          <Paper key={categoria} variant="outlined" sx={{ p: 2, borderColor: cores.border }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              {categoria}
            </Typography>
            {globais.map((linha) => {
              const chave = chaveLinha(linha);
              return (
                <FormControlLabel
                  key={chave}
                  control={
                    <Checkbox checked={Boolean(atribuidas[chave])} onChange={(e) => setAtribuidas((a) => ({ ...a, [chave]: e.target.checked }))} />
                  }
                  label={linha.nome}
                />
              );
            })}
            {linhasUnidade.length > 0 ? (
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
                  {linhasUnidade.map(({ linha, unidades: u }) => (
                    <TableRow key={linha.idPermissao}>
                      <TableCell>{linha.nome}</TableCell>
                      {unidades.map(([idUnidade]) => {
                        const lu = u.find((l) => l.idUnidadeEstoque === idUnidade);
                        if (!lu) return <TableCell key={idUnidade} align="center">—</TableCell>;
                        const chave = chaveLinha(lu);
                        return (
                          <TableCell key={idUnidade} align="center">
                            <Checkbox
                              size="small"
                              checked={Boolean(atribuidas[chave])}
                              onChange={(e) => setAtribuidas((a) => ({ ...a, [chave]: e.target.checked }))}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </Paper>
        );
      })}

      <PainelErro mensagem={erro} />
      {sucesso ? <Typography variant="body2" color="success.main">{sucesso}</Typography> : null}
      <Button variant="contained" disabled={salvando} onClick={() => void salvar()}>
        {salvando ? 'Salvando…' : 'Salvar permissões do cargo'}
      </Button>
    </Stack>
  );
}
