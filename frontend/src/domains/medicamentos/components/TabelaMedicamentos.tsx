import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Fragment, useState } from 'react';
import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';
import type { MedicamentoLeituraDto } from '../types/tiposMedicamentos';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';

type Props = {
  itens: MedicamentoLeituraDto[];
  onVisualizar: (id: number) => void;
  onEditar: (id: number) => void;
  onExcluir: (id: number) => void;
  onMovimentar: (id: number) => void;
  onRegistrarRetirada: (medicamento: MedicamentoLeituraDto, lote: ItemEstoqueDto) => void;
};

type StatusMedicamento = 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer';

type LinhaMedicamento = {
  id: number;
  codigo: string;
  nome: string;
  prioridadeNome: string;
  quantidade: number;
  status: StatusMedicamento;
  ultimaMovimentacao: string;
};

const MotionAction = motion.div;

export function obterStatusMedicamento(item: MedicamentoLeituraDto): StatusMedicamento {
  const quantidade = item.itensEstoque.reduce((acc, lote) => acc + lote.quantidade, 0);
  const minimo = item.itemNivelEstoque?.nivelMinimoEstoque ?? 0;
  const hoje = new Date();
  const limiteVencimento = new Date();
  limiteVencimento.setDate(hoje.getDate() + 30);
  const temLoteAVencer = item.itensEstoque.some((lote) => {
    if (!lote.dataValidade) return false;
    const validade = new Date(lote.dataValidade);
    if (Number.isNaN(validade.getTime())) return false;
    return validade >= hoje && validade <= limiteVencimento;
  });
  if (quantidade <= 0) return 'sem_estoque';
  if (temLoteAVencer) return 'a_vencer';
  if (quantidade < minimo) return 'baixo';
  return 'ativo';
}

function mapearLinha(item: MedicamentoLeituraDto): LinhaMedicamento {
  const quantidade = item.itensEstoque.reduce((acc, lote) => acc + lote.quantidade, 0);
  const ultimaData = item.itensEstoque
    .map((lote) => new Date(lote.dataEntrega))
    .filter((data) => !Number.isNaN(data.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    id: item.id,
    codigo: item.codigo,
    nome: item.nomeOuDescricaoSimples,
    prioridadeNome: `Prioridade ${item.prioridade}`,
    quantidade,
    status: obterStatusMedicamento(item),
    ultimaMovimentacao: ultimaData ? ultimaData.toLocaleDateString('pt-BR') : 'Sem movimentação',
  };
}

function statusChip(status: StatusMedicamento) {
  if (status === 'ativo') return <Chip label="Ativo" color="success" size="small" />;
  if (status === 'a_vencer') return <Chip label="Próximo do vencimento" color="error" size="small" />;
  if (status === 'baixo') return <Chip label="Lote abaixo do nível mínimo" color="warning" size="small" />;
  return <Chip label="Sem estoque" color="error" size="small" />;
}

function statusValidadeChip(dataValidade?: string | null, quantidadeLote = 0, nivelMinimo = 0) {
  if (quantidadeLote < nivelMinimo) return <Chip label="Nível baixo" color="warning" size="small" />;
  if (!dataValidade) return <Chip label="Sem validade" size="small" />;
  const validade = new Date(dataValidade);
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() + 30);
  if (validade < hoje) return <Chip label="Vencido" color="error" size="small" />;
  if (validade <= limite) return <Chip label="A vencer" color="error" size="small" />;
  return <Chip label="Válido" color="success" size="small" />;
}

function LoteCard({
  medicamento,
  lote,
  onRegistrarRetirada,
}: {
  medicamento: MedicamentoLeituraDto;
  lote: ItemEstoqueDto;
  onRegistrarRetirada: (medicamento: MedicamentoLeituraDto, lote: ItemEstoqueDto) => void;
}) {
  const { cores } = useEstilosListagem();
  const validade = lote.dataValidade ? new Date(lote.dataValidade).toLocaleDateString('pt-BR') : 'Sem validade';
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: `1px solid ${cores.border}`,
        '&:hover': {
          backgroundColor: cores.hoverSurfaceStrong,
        },
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography sx={{ fontWeight: 700, color: cores.textPrimary }}>Lote {lote.lote ?? '-'}</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Typography variant="caption" sx={{ color: cores.textMuted }}>
            Quantidade
          </Typography>
          <Typography sx={{ color: cores.textPrimary }}>{lote.quantidade}</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="caption" sx={{ color: cores.textMuted }}>
            Validade
          </Typography>
          <Typography sx={{ color: cores.textPrimary }}>{validade}</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          {statusValidadeChip(lote.dataValidade, lote.quantidade, medicamento.itemNivelEstoque?.nivelMinimoEstoque ?? 0)}
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onRegistrarRetirada(medicamento, lote);
            }}
            disabled={lote.quantidade <= 0}
          >
            Retirar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

function ExpandedRow({
  medicamento,
  expanded,
  onRegistrarRetirada,
}: {
  medicamento: MedicamentoLeituraDto;
  expanded: boolean;
  onRegistrarRetirada: (medicamento: MedicamentoLeituraDto, lote: ItemEstoqueDto) => void;
}) {
  const estilos = useEstilosListagem();
  const { cores } = estilos;

  return (
    <TableRow>
      <TableCell colSpan={8} sx={{ p: 0 }}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={estilos.linhaExpandida}>
            {medicamento.itensEstoque.length ? (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {medicamento.itensEstoque.map((lote, index) => (
                  <LoteCard
                    key={`${medicamento.id}-${lote.lote ?? index}`}
                    medicamento={medicamento}
                    lote={lote}
                    onRegistrarRetirada={onRegistrarRetirada}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: cores.textMuted }}>
                Nenhum lote cadastrado para este medicamento.
              </Typography>
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
}

function AcoesLinha({
  id,
  onVisualizar,
  onEditar,
  onExcluir,
  onMovimentar,
}: {
  id: number;
  onVisualizar: (id: number) => void;
  onEditar: (id: number) => void;
  onExcluir: (id: number) => void;
  onMovimentar: (id: number) => void;
}) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
      <MotionAction whileTap={{ scale: 0.92 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onVisualizar(id);
          }}
          sx={{ color: '#93c5fd', '&:hover': { backgroundColor: 'rgba(56,189,248,0.15)', color: '#bae6fd' } }}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      </MotionAction>
      <MotionAction whileTap={{ scale: 0.92 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEditar(id);
          }}
          sx={{ color: '#a5b4fc', '&:hover': { backgroundColor: 'rgba(99,102,241,0.16)', color: '#c7d2fe' } }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </MotionAction>
      <MotionAction whileTap={{ scale: 0.92 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onExcluir(id);
          }}
          sx={{ color: '#fca5a5', '&:hover': { backgroundColor: 'rgba(239,68,68,0.16)', color: '#fecaca' } }}
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </MotionAction>
      <MotionAction whileTap={{ scale: 0.92 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMovimentar(id);
          }}
          sx={{ color: '#67e8f9', '&:hover': { backgroundColor: 'rgba(34,211,238,0.16)', color: '#a5f3fc' } }}
        >
          <LocalShippingOutlinedIcon fontSize="small" />
        </IconButton>
      </MotionAction>
    </Stack>
  );
}

export function TabelaMedicamentos({
  itens,
  onVisualizar,
  onEditar,
  onExcluir,
  onMovimentar,
  onRegistrarRetirada,
}: Props) {
  const estilos = useEstilosListagem();
  const { cores } = estilos;
  const theme = useTheme();
  const ehMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleToggleRow = (medicamentoId: number) => {
    setExpandedRow((prev) => (prev === medicamentoId ? null : medicamentoId));
  };

  if (itens.length === 0) return <p>Nenhum medicamento encontrado.</p>;
  const linhas = itens.map(mapearLinha);

  if (ehMobile) {
    return (
      <Stack sx={{ gap: 1.2 }}>
        {linhas.map((linha) => (
          <Card key={linha.id} sx={estilos.cardMobile}>
            <CardContent>
              <Stack sx={{ gap: 1 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                    {linha.nome}
                  </Typography>
                  {statusChip(linha.status)}
                </Stack>
                <Typography variant="body2" sx={estilos.celulaTexto}>Código: {linha.codigo}</Typography>
                <Typography variant="body2" sx={estilos.celulaTexto}>Prioridade: {linha.prioridadeNome}</Typography>
                <Typography variant="body2" sx={estilos.celulaTexto}>Quantidade: {linha.quantidade}</Typography>
                <Typography variant="body2" sx={estilos.celulaTexto}>Última movimentação: {linha.ultimaMovimentacao}</Typography>
                <AcoesLinha
                  id={linha.id}
                  onVisualizar={onVisualizar}
                  onEditar={onEditar}
                  onExcluir={onExcluir}
                  onMovimentar={onMovimentar}
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Card sx={estilos.cardTabela}>
      <Table>
        <TableHead>
          <TableRow sx={estilos.cabecalhoTabela}>
            <TableCell sx={{ width: 54 }} />
            <TableCell sx={estilos.celulaCabecalho}>Código</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Nome</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Prioridade</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Quantidade</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Status</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Última movimentação</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itens.map((medicamento) => {
            const linha = mapearLinha(medicamento);
            const expanded = expandedRow === medicamento.id;
            return (
              <Fragment key={medicamento.id}>
                <TableRow
                  hover
                  onClick={() => handleToggleRow(medicamento.id)}
                  sx={{
                    cursor: 'pointer',
                    borderBottom: `1px solid ${cores.border}`,
                    transition: 'background-color 0.15s ease',
                    backgroundColor: expanded ? cores.hoverSurfaceStrong : 'transparent',
                    '&:hover': { backgroundColor: cores.hoverSurface },
                  }}
                >
                  <TableCell sx={{ color: '#93c5fd' }}>
                    {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </TableCell>
                  <TableCell sx={estilos.celulaTexto}>{linha.codigo}</TableCell>
                  <TableCell sx={estilos.celulaTexto}>{linha.nome}</TableCell>
                  <TableCell sx={estilos.celulaTexto}>{linha.prioridadeNome}</TableCell>
                  <TableCell sx={estilos.celulaTexto}>{linha.quantidade}</TableCell>
                  <TableCell>{statusChip(linha.status)}</TableCell>
                  <TableCell sx={estilos.celulaTexto}>{linha.ultimaMovimentacao}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <AcoesLinha
                      id={linha.id}
                      onVisualizar={onVisualizar}
                      onEditar={onEditar}
                      onExcluir={onExcluir}
                      onMovimentar={onMovimentar}
                    />
                  </TableCell>
                </TableRow>
                <ExpandedRow
                  medicamento={medicamento}
                  expanded={expanded}
                  onRegistrarRetirada={onRegistrarRetirada}
                />
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
