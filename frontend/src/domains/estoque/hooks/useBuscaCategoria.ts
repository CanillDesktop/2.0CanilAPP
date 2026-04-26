import { useEffect, useMemo, useState } from 'react';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

export type CategoriaBusca = 'produto' | 'medicamento' | 'insumo';

export function useBuscaCategoria(itens: LinhaOperacionalEstoque[], categoria: CategoriaBusca) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedTerm(searchTerm.trim().toLowerCase());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchTerm]);

  const resultados = useMemo(() => {
    const daCategoria = itens.filter((item) => item.origem === categoria);
    if (!debouncedTerm) return daCategoria;
    return daCategoria.filter((item) => item.nome.toLowerCase().includes(debouncedTerm));
  }, [itens, categoria, debouncedTerm]);

  return { searchTerm, setSearchTerm, resultados };
}
