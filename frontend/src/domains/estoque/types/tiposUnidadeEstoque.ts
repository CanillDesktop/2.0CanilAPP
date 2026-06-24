export type UnidadeEstoqueDto = {
  id: number;
  nome: string;
  sigla: string;
  tipo: string;
  ativa: boolean;
};

export type ContextoUnidadeEstoqueDto = {
  unidadeAtivaId: number;
  unidadeAtivaNome: string;
  unidadeAtivaSigla: string;
  unidadesDisponiveis: UnidadeEstoqueDto[];
};

export type PermissoesUnidadeAtiva = {
  podeConsultar: boolean;
  podeEntrada: boolean;
  podeSaida: boolean;
  podeTransferirEnviar: boolean;
  podeTransferirReceber: boolean;
};
