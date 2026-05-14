import { useMemo } from 'react';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

export type CampoOrdenacaoEstoque = 'nome' | 'quantidade' | 'validade' | 'status' | 'ultimaMovimentacao';

const ORDEM_STATUS: Record<LinhaOperacionalEstoque['status'], number> = {
  ok: 0,
  baixo: 1,
  proximo_vencimento: 2,
  critico: 3,
};

function inicioDiaUtc(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00`).getTime();
}

function fimDiaUtc(isoDate: string): number {
  return new Date(`${isoDate}T23:59:59.999`).getTime();
}

export type OpcoesProcessamentoEstoque = {
  origemAlvo: 'produto' | 'medicamento' | 'insumo';
  debouncedSearch: string;
  statusFiltro: '' | LinhaOperacionalEstoque['status'];
  qtdMin: string;
  qtdMax: string;
  validadeDe: string;
  validadeAte: string;
  movDe: string;
  movAte: string;
  orderBy: CampoOrdenacaoEstoque;
  orderDirection: 'asc' | 'desc';
  page: number;
  rowsPerPage: number;
};

export function useListaEstoqueProcessada(linhas: LinhaOperacionalEstoque[], opcoes: OpcoesProcessamentoEstoque) {
  return useMemo(() => {
    const {
      origemAlvo,
      debouncedSearch,
      statusFiltro,
      qtdMin,
      qtdMax,
      validadeDe,
      validadeAte,
      movDe,
      movAte,
      orderBy,
      orderDirection,
      page,
      rowsPerPage,
    } = opcoes;

    const termo = debouncedSearch.trim().toLowerCase();
    const minQ = qtdMin.trim() === '' ? null : Number(qtdMin);
    const maxQ = qtdMax.trim() === '' ? null : Number(qtdMax);
    const filtraValidade = Boolean(validadeDe || validadeAte);
    const filtraMov = Boolean(movDe || movAte);

    const vDe = validadeDe ? inicioDiaUtc(validadeDe) : null;
    const vAte = validadeAte ? fimDiaUtc(validadeAte) : null;
    const mDe = movDe ? inicioDiaUtc(movDe) : null;
    const mAte = movAte ? fimDiaUtc(movAte) : null;

    const filtrados = linhas.filter((item) => {
      if (item.origem !== origemAlvo) return false;
      if (termo && !item.nome.toLowerCase().includes(termo)) return false;
      if (statusFiltro && item.status !== statusFiltro) return false;
      if (minQ !== null && !Number.isNaN(minQ) && item.quantidade < minQ) return false;
      if (maxQ !== null && !Number.isNaN(maxQ) && item.quantidade > maxQ) return false;

      if (filtraValidade) {
        const ms = item.validadeMs;
        if (ms == null) return false;
        if (vDe !== null && ms < vDe) return false;
        if (vAte !== null && ms > vAte) return false;
      }

      if (filtraMov) {
        const ms = item.movimentacaoMs;
        if (ms == null) return false;
        if (mDe !== null && ms < mDe) return false;
        if (mAte !== null && ms > mAte) return false;
      }

      return true;
    });

    const ordenados = [...filtrados].sort((a, b) => {
      let cmp = 0;
      if (orderBy === 'nome') {
        cmp = a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
      } else if (orderBy === 'quantidade') {
        cmp = a.quantidade - b.quantidade;
      } else if (orderBy === 'validade') {
        const va = a.validadeMs ?? -Infinity;
        const vb = b.validadeMs ?? -Infinity;
        cmp = va - vb;
      } else if (orderBy === 'status') {
        cmp = ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status];
      } else {
        const ma = a.movimentacaoMs ?? -Infinity;
        const mb = b.movimentacaoMs ?? -Infinity;
        cmp = ma - mb;
      }
      return orderDirection === 'asc' ? cmp : -cmp;
    });

    const totalFiltrado = ordenados.length;
    const totalPages = totalFiltrado === 0 ? 1 : Math.ceil(totalFiltrado / rowsPerPage);
    const paginaSegura = Math.min(Math.max(1, page), totalPages);
    const start = (paginaSegura - 1) * rowsPerPage;
    const paginados = ordenados.slice(start, start + rowsPerPage);

    return {
      dadosPaginados: paginados,
      totalFiltrado,
      totalPages,
      paginaSegura,
      dadosOrdenados: ordenados,
    };
  }, [linhas, opcoes]);
}
