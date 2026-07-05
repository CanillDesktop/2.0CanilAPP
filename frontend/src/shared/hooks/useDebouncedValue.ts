import { useEffect, useState } from 'react';

/** Retorna uma cópia debounced de <paramref name="valor"/> após o atraso informado. */
export function useDebouncedValue<T>(valor: T, atrasoMs = 300): T {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(valor), atrasoMs);
    return () => window.clearTimeout(timeout);
  }, [valor, atrasoMs]);

  return debounced;
}
