import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { KeyboardEvent, RefObject } from 'react';
import { useRef } from 'react';
import { useTemaApp } from '../../../../app/providers/ContextoTemaApp';
import { estilosCampoFormulario } from '../../../../shared/theme/estilosCampos';
import {
  type ValorCampoInteiro,
  campoInteiroPositivo,
  valorCampoInteiroDeInput,
} from '../../../../shared/utils/campoInteiroFormulario';
import type { LinhaOperacionalEstoque } from '../../types/tiposEstoque';

export type LinhaItemTransferencia = {
  chave: string;
  idItem: number;
  codigo: string;
  descricaoItem: string;
  origem: LinhaOperacionalEstoque['origem'] | '';
  lote: string;
  quantidade: ValorCampoInteiro;
  loteObrigatorio: boolean;
  saldoLote?: number;
};

export function novaLinhaItemTransferencia(): LinhaItemTransferencia {
  return {
    chave: crypto.randomUUID(),
    idItem: 0,
    codigo: '',
    descricaoItem: '',
    origem: '',
    lote: '',
    quantidade: '',
    loteObrigatorio: true,
  };
}

type Props = {
  item: LinhaItemTransferencia;
  indice: number;
  isMobile: boolean;
  podeRemover: boolean;
  refsLote: RefObject<(HTMLInputElement | null)[]>;
  refsQuantidade: RefObject<(HTMLInputElement | null)[]>;
  onChange: (indice: number, patch: Partial<LinhaItemTransferencia>) => void;
  onRemover: (indice: number) => void;
  onAbrirLookupItem: (indice: number) => void;
  onAbrirLookupLote: (indice: number) => void;
  onEnterQuantidade: (indice: number) => void;
};

function rotuloOrigem(origem: LinhaItemTransferencia['origem']) {
  if (origem === 'medicamento') return 'Medicamento';
  if (origem === 'insumo') return 'Insumo';
  if (origem === 'produto') return 'Produto';
  return '';
}

const sxHelperAlinhado = {
  minHeight: 20,
  lineHeight: 1.25,
  mt: 0.5,
};

const sxCampoLinha = {
  '& .MuiFormHelperText-root': sxHelperAlinhado,
};

function helperItem(item: LinhaItemTransferencia, isMobile: boolean) {
  if (item.idItem > 0) {
    const partes = [`ID ${item.idItem}`];
    if (item.codigo.trim()) partes.push(item.codigo);
    return partes.join(' · ');
  }
  return isMobile ? 'Toque para selecionar' : 'F2 para pesquisar';
}

function helperLote(item: LinhaItemTransferencia, isMobile: boolean) {
  if (!item.loteObrigatorio) return 'Sem controle de lote';
  if (item.idItem <= 0) return 'Selecione o item antes';
  return isMobile ? 'Toque para selecionar' : 'F2 para pesquisar';
}

function helperQuantidade(item: LinhaItemTransferencia, isMobile: boolean) {
  if (item.saldoLote != null) return `Saldo: ${item.saldoLote}`;
  return isMobile ? 'Confirmar adiciona linha' : 'Enter confirma linha';
}

export function LinhaItemFormularioTransferencia({
  item,
  indice,
  isMobile,
  podeRemover,
  refsLote,
  refsQuantidade,
  onChange,
  onRemover,
  onAbrirLookupItem,
  onAbrirLookupLote,
  onEnterQuantidade,
}: Props) {
  const { cores } = useTemaApp();
  const campoSx = { ...estilosCampoFormulario(cores), ...sxCampoLinha };
  const inputItemRef = useRef<HTMLInputElement>(null);

  const loteDesabilitado = item.idItem <= 0 || !item.loteObrigatorio;

  function aoTeclaCampo(e: KeyboardEvent, tipo: 'item' | 'lote' | 'quantidade') {
    if (e.key === 'F2') {
      e.preventDefault();
      if (tipo === 'item') onAbrirLookupItem(indice);
      else if (tipo === 'lote' && !loteDesabilitado) onAbrirLookupLote(indice);
    }
    if (tipo === 'quantidade' && e.key === 'Enter') {
      e.preventDefault();
      if (campoInteiroPositivo(item.quantidade)) onEnterQuantidade(indice);
    }
  }

  const botaoBuscaItem = (
    <InputAdornment position="end">
      <Tooltip title={isMobile ? 'Selecionar item' : 'Pesquisar item (F2)'}>
        <IconButton
          edge="end"
          aria-label="Pesquisar item"
          onClick={() => onAbrirLookupItem(indice)}
          sx={{ minWidth: { xs: 44, sm: 40 }, minHeight: { xs: 44, sm: 40 } }}
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );

  const botaoBuscaLote = item.loteObrigatorio ? (
    <InputAdornment position="end">
      <Tooltip title={isMobile ? 'Selecionar lote' : 'Pesquisar lote (F2)'}>
        <span>
          <IconButton
            edge="end"
            aria-label="Pesquisar lote"
            disabled={loteDesabilitado}
            onClick={() => onAbrirLookupLote(indice)}
            sx={{ minWidth: { xs: 44, sm: 40 }, minHeight: { xs: 44, sm: 40 } }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </InputAdornment>
  ) : undefined;

  const campos = (
    <Grid container spacing={isMobile ? 1.25 : 1.5} sx={{ alignItems: 'flex-start' }}>
      <Grid size={isMobile ? 12 : { xs: 12, md: 5, lg: 6 }}>
        <TextField
          fullWidth
          label="Item"
          value={item.descricaoItem}
          placeholder={isMobile ? 'Toque para selecionar' : 'Pesquisar por descrição, código ou ID (F2)'}
          inputRef={inputItemRef}
          onKeyDown={(e) => aoTeclaCampo(e, 'item')}
          onClick={() => onAbrirLookupItem(indice)}
          sx={{ ...campoSx, '& input': { cursor: 'pointer' } }}
          helperText={helperItem(item, isMobile)}
          slotProps={{
            input: {
              readOnly: true,
              endAdornment: botaoBuscaItem,
            },
          }}
        />
      </Grid>
      <Grid size={isMobile ? 12 : { xs: 12, sm: 6, md: 3, lg: 3 }}>
        <TextField
          fullWidth
          label="Lote"
          value={item.lote}
          disabled={loteDesabilitado}
          inputRef={(el) => {
            refsLote.current[indice] = el;
          }}
          onKeyDown={(e) => aoTeclaCampo(e, 'lote')}
          onClick={() => {
            if (isMobile && !loteDesabilitado) onAbrirLookupLote(indice);
          }}
          onChange={(e) => {
            if (isMobile) return;
            onChange(indice, { lote: e.target.value, saldoLote: undefined });
          }}
          sx={{
            ...campoSx,
            ...(isMobile && !loteDesabilitado ? { '& input': { cursor: 'pointer' } } : {}),
          }}
          helperText={helperLote(item, isMobile)}
          slotProps={{
            input: {
              readOnly: isMobile,
              endAdornment: botaoBuscaLote,
            },
          }}
        />
      </Grid>
      <Grid size={isMobile ? 12 : { xs: 12, sm: 6, md: 2 }}>
        <TextField
          fullWidth
          type="number"
          label="Quantidade"
          value={item.quantidade}
          inputRef={(el) => {
            refsQuantidade.current[indice] = el;
          }}
          onKeyDown={(e) => aoTeclaCampo(e, 'quantidade')}
          onChange={(e) => onChange(indice, { quantidade: valorCampoInteiroDeInput(e.target.value) })}
          slotProps={{
            htmlInput: { min: 1, inputMode: 'numeric' },
          }}
          helperText={helperQuantidade(item, isMobile)}
          sx={campoSx}
        />
      </Grid>
      <Grid
        size={isMobile ? 12 : { xs: 12, md: 2, lg: 1 }}
        sx={{
          display: isMobile ? 'none' : 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          pt: '26px',
        }}
      >
        <IconButton
          aria-label="Remover item"
          disabled={!podeRemover}
          onClick={() => onRemover(indice)}
          sx={{ mt: 0.5 }}
        >
          <DeleteOutlineOutlinedIcon />
        </IconButton>
      </Grid>
    </Grid>
  );

  if (isMobile) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 1.25, borderRadius: 2, borderColor: cores.border, bgcolor: cores.bgInput }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: cores.textMuted }}>
            Item {indice + 1}
            {item.origem ? ` · ${rotuloOrigem(item.origem)}` : ''}
          </Typography>
          {!podeRemover ? null : (
            <IconButton
              aria-label="Remover item"
              onClick={() => onRemover(indice)}
              size="small"
              sx={{ minWidth: 44, minHeight: 44, color: cores.acaoExcluir }}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        {campos}
      </Paper>
    );
  }

  return <Box>{campos}</Box>;
}
