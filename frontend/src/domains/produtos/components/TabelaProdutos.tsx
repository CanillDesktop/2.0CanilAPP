import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Button,
  Grid,
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
import type { ProdutoLeituraDto } from '../types/tiposProdutos';
import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';
import { useEstilosListagem } from '../../../shared/theme/useEstilosListagem';

type Props = {
  itens: ProdutoLeituraDto[];
  onVisualizar: (id: number) => void;
  onEditar: (id: number) => void;
  onExcluir: (id: number) => void;
  onMovimentar: (id: number) => void;
  onRegistrarRetirada: (produto: ProdutoLeituraDto, lote: ItemEstoqueDto) => void;
};

type LinhaProduto = {
  id: number;
  codigo: string;
  nome: string;
  categoriaNome: string;
  quantidade: number;
  status: 'ativo' | 'baixo' | 'sem_estoque' | 'a_vencer';
  ultimaMovimentacao: string;
};

const MotionAction = motion.div;

function categoriaNome(categoria: number) {
  if (categoria === 1) return 'Ração';
  if (categoria === 2) return 'Higiene';
  if (categoria === 3) return 'Acessório';
  return `Categoria ${categoria}`;
}

function mapearLinha(item: ProdutoLeituraDto): LinhaProduto {
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
  const ultimaData = item.itensEstoque
    .map((lote) => new Date(lote.dataEntrega))
    .filter((data) => !Number.isNaN(data.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  let status: LinhaProduto['status'] = 'ativo';
  if (quantidade <= 0) status = 'sem_estoque';
  else if (temLoteAVencer) status = 'a_vencer';
  else if (quantidade < minimo) status = 'baixo';

  return {
    id: item.id,
    codigo: item.codigo,
    nome: item.nomeOuDescricaoSimples,
    categoriaNome: categoriaNome(item.categoria),
    quantidade,
    status,
    ultimaMovimentacao: ultimaData ? ultimaData.toLocaleDateString('pt-BR') : 'Sem movimentação',
  };
}

function statusChip(status: LinhaProduto['status']) {
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
  produto,
  lote,
  onRegistrarRetirada,
}: {
  produto: ProdutoLeituraDto;
  lote: ItemEstoqueDto;
  onRegistrarRetirada: (produto: ProdutoLeituraDto, lote: ItemEstoqueDto) => void;
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
          {statusValidadeChip(lote.dataValidade, lote.quantidade, produto.itemNivelEstoque?.nivelMinimoEstoque ?? 0)}
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onRegistrarRetirada(produto, lote);
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
  produto,
  expanded,
  onRegistrarRetirada,
}: {
  produto: ProdutoLeituraDto;
  expanded: boolean;
  onRegistrarRetirada: (produto: ProdutoLeituraDto, lote: ItemEstoqueDto) => void;
}) {
  const estilos = useEstilosListagem();
  const { cores } = estilos;

  return (
    <TableRow>
      <TableCell colSpan={8} sx={{ p: 0 }}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={estilos.linhaExpandida}>
            {produto.itensEstoque.length ? (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {produto.itensEstoque.map((lote, index) => (
                  <LoteCard
                    key={`${produto.id}-${lote.lote ?? index}`}
                    produto={produto}
                    lote={lote}
                    onRegistrarRetirada={onRegistrarRetirada}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: cores.textMuted }}>
                Nenhum lote cadastrado para este produto.
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
  const { iconeAcao } = useEstilosListagem();

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
      <MotionAction whileTap={{ scale: 0.92 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onVisualizar(id);
          }}
          sx={iconeAcao.visualizar}
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
          sx={iconeAcao.editar}
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
          sx={iconeAcao.excluir}
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
          sx={iconeAcao.movimentar}
        >
          <LocalShippingOutlinedIcon fontSize="small" />
        </IconButton>
      </MotionAction>
    </Stack>
  );
}

export function TabelaProdutos({ itens, onVisualizar, onEditar, onExcluir, onMovimentar, onRegistrarRetirada }: Props) {
  const estilos = useEstilosListagem();
  const { cores } = estilos;
  const theme = useTheme();
  const ehMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleToggleRow = (produtoId: number) => {
    setExpandedRow((prev) => (prev === produtoId ? null : produtoId));
  };

  if (itens.length === 0) return <p>Nenhum produto encontrado.</p>;
  const linhas = itens.map(mapearLinha);

  if (ehMobile) {
    return (
      <Stack sx={{ gap: 1.2 }}>
        {linhas.map((linha) => (
          <Card
            key={linha.id}
            sx={estilos.cardMobile}
          >
            <CardContent>
              <Stack sx={{ gap: 1 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cores.textPrimary }}>
                    {linha.nome}
                  </Typography>
                  {statusChip(linha.status)}
                </Stack>
                <Typography variant="body2" sx={estilos.celulaTexto}>Código: {linha.codigo}</Typography>
                <Typography variant="body2" sx={estilos.celulaTexto}>Categoria: {linha.categoriaNome}</Typography>
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
            <TableCell sx={estilos.celulaCabecalho}>Categoria</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Quantidade</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Status</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Última movimentação</TableCell>
            <TableCell sx={estilos.celulaCabecalho}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itens.map((produto) => {
            const linha = mapearLinha(produto);
            const expanded = expandedRow === produto.id;
            return (
              <Fragment key={produto.id}>
                <TableRow
                  key={linha.id}
                  hover
                  onClick={() => handleToggleRow(produto.id)}
                  sx={{
                    cursor: 'pointer',
                    borderBottom: `1px solid ${cores.border}`,
                    transition: 'background-color 0.15s ease',
                    backgroundColor: expanded ? cores.hoverSurfaceStrong : 'transparent',
                    '&:hover': { backgroundColor: cores.hoverSurface },
                  }}
                >
                  <TableCell sx={{ color: cores.chipIcon }}>
                    {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </TableCell>
                  <TableCell sx={estilos.celulaTexto}>{linha.codigo}</TableCell>
                  <TableCell sx={estilos.celulaTexto}>{linha.nome}</TableCell>
                  <TableCell sx={estilos.celulaTexto}>{linha.categoriaNome}</TableCell>
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
                  produto={produto}
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
