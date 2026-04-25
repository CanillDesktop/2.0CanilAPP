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
  status: 'ativo' | 'baixo' | 'sem_estoque';
  ultimaMovimentacao: string;
};

const MotionAction = motion.div;

function categoriaNome(categoria: number) {
  if (categoria === 1) return 'Racao';
  if (categoria === 2) return 'Higiene';
  if (categoria === 3) return 'Acessorio';
  return `Categoria ${categoria}`;
}

function mapearLinha(item: ProdutoLeituraDto): LinhaProduto {
  const quantidade = item.itensEstoque.reduce((acc, lote) => acc + lote.quantidade, 0);
  const minimo = item.itemNivelEstoque?.nivelMinimoEstoque ?? 0;
  const ultimaData = item.itensEstoque
    .map((lote) => new Date(lote.dataEntrega))
    .filter((data) => !Number.isNaN(data.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  let status: LinhaProduto['status'] = 'ativo';
  if (quantidade <= 0) status = 'sem_estoque';
  else if (quantidade < minimo) status = 'baixo';

  return {
    id: item.idItem,
    codigo: item.codItem,
    nome: item.nomeItem,
    categoriaNome: categoriaNome(item.categoria),
    quantidade,
    status,
    ultimaMovimentacao: ultimaData ? ultimaData.toLocaleDateString('pt-BR') : 'Sem movimentacao',
  };
}

function statusChip(status: LinhaProduto['status']) {
  if (status === 'ativo') return <Chip label="Ativo" color="success" size="small" />;
  if (status === 'baixo') return <Chip label="Baixo" color="warning" size="small" />;
  return <Chip label="Sem estoque" color="error" size="small" />;
}

function statusValidadeChip(dataValidade?: string | null) {
  if (!dataValidade) return <Chip label="Sem validade" size="small" />;
  const validade = new Date(dataValidade);
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() + 30);
  if (validade < hoje) return <Chip label="Vencido" color="error" size="small" />;
  if (validade <= limite) return <Chip label="Proximo" color="warning" size="small" />;
  return <Chip label="Valido" color="success" size="small" />;
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
  const validade = lote.dataValidade ? new Date(lote.dataValidade).toLocaleDateString('pt-BR') : 'Sem validade';
  return (
    <Card
      sx={{ mb: 1.5, p: 1.5, borderRadius: 2, backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#e2e8f0' }}>Lote {lote.lote ?? '-'}</Typography>
          <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
            Qtd: {lote.quantidade} • Validade: {validade}
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onRegistrarRetirada(produto, lote);
            }}
            disabled={lote.quantidade <= 0}
          >
            Registrar retirada
          </Button>
        </Box>
        {statusValidadeChip(lote.dataValidade)}
      </Box>
    </Card>
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
  return (
    <TableRow>
      <TableCell colSpan={8} sx={{ p: 0 }}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2, bgcolor: '#020617' }}>
            {produto.itensEstoque.length ? (
              produto.itensEstoque.map((lote, index) => (
                <LoteCard
                  key={`${produto.idItem}-${lote.lote ?? index}`}
                  produto={produto}
                  lote={lote}
                  onRegistrarRetirada={onRegistrarRetirada}
                />
              ))
            ) : (
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
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

export function TabelaProdutos({ itens, onVisualizar, onEditar, onExcluir, onMovimentar, onRegistrarRetirada }: Props) {
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
            sx={{
              borderRadius: 3,
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'translateY(-1px)' },
            }}
          >
            <CardContent>
              <Stack sx={{ gap: 1 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                    {linha.nome}
                  </Typography>
                  {statusChip(linha.status)}
                </Stack>
                <Typography variant="body2" sx={{ color: '#e2e8f0' }}>Codigo: {linha.codigo}</Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0' }}>Categoria: {linha.categoriaNome}</Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0' }}>Quantidade: {linha.quantidade}</Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0' }}>Ultima movimentacao: {linha.ultimaMovimentacao}</Typography>
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
    <Card sx={{ borderRadius: 3, backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#020617' }}>
            <TableCell sx={{ width: 54 }} />
            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Codigo</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Nome</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Categoria</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Quantidade</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Ultima movimentacao</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>Acoes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itens.map((produto) => {
            const linha = mapearLinha(produto);
            const expanded = expandedRow === produto.idItem;
            return (
              <Fragment key={produto.idItem}>
                <TableRow
                  key={linha.id}
                  hover
                  onClick={() => handleToggleRow(produto.idItem)}
                  sx={{
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background-color 0.15s ease',
                    backgroundColor: expanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
                  }}
                >
                  <TableCell sx={{ color: '#93c5fd' }}>
                    {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </TableCell>
                  <TableCell sx={{ color: '#e2e8f0' }}>{linha.codigo}</TableCell>
                  <TableCell sx={{ color: '#e2e8f0' }}>{linha.nome}</TableCell>
                  <TableCell sx={{ color: '#e2e8f0' }}>{linha.categoriaNome}</TableCell>
                  <TableCell sx={{ color: '#e2e8f0' }}>{linha.quantidade}</TableCell>
                  <TableCell>{statusChip(linha.status)}</TableCell>
                  <TableCell sx={{ color: '#e2e8f0' }}>{linha.ultimaMovimentacao}</TableCell>
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
