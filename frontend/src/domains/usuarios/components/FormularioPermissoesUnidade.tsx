import {
  Box,
  Button,
  Checkbox,
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
import { useEffect, useMemo, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { extrairMensagemErroApi, ErroApi } from '../../../infrastructure/http/erroApi';
import { UnidadeEstoqueIds } from '../../estoque/constants/unidadesEstoque';
import { PainelErro } from '../../../shared/components/PainelErro';
import type {
  UsuarioCriadoDto,
  UsuarioUnidadeEstoqueAtribuicaoDto,
  UsuarioUnidadeEstoqueDto,
} from '../types/tiposUsuarios';
import { usuariosService } from '../services/usuariosService';

const UNIDADES_DISPONIVEIS = [
  { id: UnidadeEstoqueIds.Secretaria, nome: 'Secretaria' },
  { id: UnidadeEstoqueIds.Canil, nome: 'Canil' },
] as const;

const COLUNAS = [
  { chave: 'podeConsultar' as const, rotulo: 'Consultar' },
  { chave: 'podeEntrada' as const, rotulo: 'Entrada' },
  { chave: 'podeSaida' as const, rotulo: 'Saída' },
  { chave: 'podeTransferirEnviar' as const, rotulo: 'Enviar transf.' },
  { chave: 'podeTransferirReceber' as const, rotulo: 'Receber transf.' },
];

function paraAtribuicao(vinculo: UsuarioUnidadeEstoqueDto): UsuarioUnidadeEstoqueAtribuicaoDto {
  return {
    idUnidadeEstoque: vinculo.idUnidadeEstoque,
    podeConsultar: vinculo.podeConsultar,
    podeEntrada: vinculo.podeEntrada,
    podeSaida: vinculo.podeSaida,
    podeTransferirEnviar: vinculo.podeTransferirEnviar,
    podeTransferirReceber: vinculo.podeTransferirReceber,
  };
}

function estadoInicialLinha(idUnidade: number): UsuarioUnidadeEstoqueAtribuicaoDto {
  const ehCanil = idUnidade === UnidadeEstoqueIds.Canil;
  return {
    idUnidadeEstoque: idUnidade,
    podeConsultar: true,
    podeEntrada: true,
    podeSaida: true,
    podeTransferirEnviar: !ehCanil,
    podeTransferirReceber: ehCanil,
  };
}

type Props = {
  usuario: UsuarioCriadoDto;
  aoSalvar?: () => void;
};

export function FormularioPermissoesUnidade({ usuario, aoSalvar }: Props) {
  const { cores } = useTemaApp();
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosValidacao, setErrosValidacao] = useState<string[] | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<UsuarioUnidadeEstoqueAtribuicaoDto[]>([]);
  const [unidadesAtivas, setUnidadesAtivas] = useState<number[]>([]);

  useEffect(() => {
    if (!usuario.id) return;
    let ativo = true;
    setCarregando(true);
    setErro(null);
    void usuariosService
      .listarUnidadesEstoque(usuario.id)
      .then((lista) => {
        if (!ativo) return;
        if (lista.length > 0) {
          setLinhas(lista.map(paraAtribuicao));
          setUnidadesAtivas(lista.map((l) => l.idUnidadeEstoque));
        } else {
          setLinhas([estadoInicialLinha(UnidadeEstoqueIds.Secretaria)]);
          setUnidadesAtivas([UnidadeEstoqueIds.Secretaria]);
        }
      })
      .catch((e) => {
        if (ativo) setErro(extrairMensagemErroApi(e));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [usuario.id]);

  const nomeExibicao = useMemo(
    () => `${usuario.primeiroNome} ${usuario.sobrenome ?? ''}`.trim(),
    [usuario.primeiroNome, usuario.sobrenome],
  );

  function alternarUnidade(idUnidade: number, ativa: boolean) {
    if (ativa) {
      setUnidadesAtivas((atual) => [...atual, idUnidade]);
      setLinhas((atual) =>
        atual.some((l) => l.idUnidadeEstoque === idUnidade)
          ? atual
          : [...atual, estadoInicialLinha(idUnidade)],
      );
      return;
    }
    setUnidadesAtivas((atual) => atual.filter((id) => id !== idUnidade));
    setLinhas((atual) => atual.filter((l) => l.idUnidadeEstoque !== idUnidade));
  }

  function alterarPermissao(
    idUnidade: number,
    campo: keyof Omit<UsuarioUnidadeEstoqueAtribuicaoDto, 'idUnidadeEstoque'>,
    valor: boolean,
  ) {
    setLinhas((atual) =>
      atual.map((l) => (l.idUnidadeEstoque === idUnidade ? { ...l, [campo]: valor } : l)),
    );
  }

  async function salvar() {
    if (!usuario.id || unidadesAtivas.length === 0) return;
    setSalvando(true);
    setErro(null);
    setErrosValidacao(null);
    setSucesso(null);
    const unidades = linhas.filter((l) => unidadesAtivas.includes(l.idUnidadeEstoque));
    try {
      await usuariosService.atualizar(usuario.id, {
        primeiroNome: usuario.primeiroNome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        permissao: usuario.permissao,
        unidadesEstoque: unidades,
      });
      setSucesso('Permissões atualizadas com sucesso.');
      aoSalvar?.();
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      if (e instanceof ErroApi && e.errors) {
        setErrosValidacao(e.extrairMensagemErros());
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cores.textPrimary }}>
        {nomeExibicao}
      </Typography>
      <Typography variant="body2" sx={{ color: cores.textSecondary }}>
        {usuario.email}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        {UNIDADES_DISPONIVEIS.map((u) => (
          <FormControlLabel
            key={u.id}
            control={
              <Checkbox
                checked={unidadesAtivas.includes(u.id)}
                onChange={(e) => alternarUnidade(u.id, e.target.checked)}
              />
            }
            label={`Acesso à ${u.nome}`}
          />
        ))}
      </Stack>

      <Paper variant="outlined" sx={{ borderColor: cores.border, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Unidade</TableCell>
              {COLUNAS.map((c) => (
                <TableCell key={c.chave} align="center">
                  {c.rotulo}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {UNIDADES_DISPONIVEIS.filter((u) => unidadesAtivas.includes(u.id)).map((u) => {
              const linha = linhas.find((l) => l.idUnidadeEstoque === u.id);
              if (!linha) return null;
              return (
                <TableRow key={u.id}>
                  <TableCell>{u.nome}</TableCell>
                  {COLUNAS.map((c) => (
                    <TableCell key={c.chave} align="center">
                      <Checkbox
                        size="small"
                        checked={Boolean(linha[c.chave])}
                        onChange={(e) => alterarPermissao(u.id, c.chave, e.target.checked)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <PainelErro mensagem={erro} errosValidacao={errosValidacao} />
      {sucesso ? (
        <Typography variant="body2" sx={{ color: cores.accent }}>
          {sucesso}
        </Typography>
      ) : null}

      <Box>
        <Button
          variant="contained"
          disabled={carregando || salvando || unidadesAtivas.length === 0}
          onClick={() => void salvar()}
        >
          {salvando ? 'Salvando…' : 'Salvar permissões'}
        </Button>
      </Box>
    </Stack>
  );
}
