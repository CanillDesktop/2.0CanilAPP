/** Opções do filtro de prioridade (espelha enum do backend). */
export const OPCOES_PRIORIDADE_MEDICAMENTO_FILTRO: { valor: number; rotulo: string }[] = [
  { valor: 0, rotulo: 'Baixa' },
  { valor: 1, rotulo: 'Média' },
  { valor: 2, rotulo: 'Alta' },
];

/** Opções do filtro de público-alvo (espelha enum do backend). */
export const OPCOES_PUBLICO_ALVO_MEDICAMENTO_FILTRO: { valor: number; rotulo: string }[] = [
  { valor: 0, rotulo: 'Animal' },
  { valor: 1, rotulo: 'Humano e animal' },
];
