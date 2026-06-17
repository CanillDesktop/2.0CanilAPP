namespace Backend.Filtro.Medicamentos
{
    public class MedicamentosFiltro
    {
        /// <summary>
        /// Opcional: busca OR pelos campos: Codigo, Descricao, Formula, NomeComercial, nFe e Lote
        /// </summary>
        public string? Termo { get; set; }

        /// <summary>Prioridade (enum int). Ausente ou null = todas.</summary>
        public int? Prioridade { get; set; }

        /// <summary>PublicoAlvo (enum int). Ausente ou null = todas.</summary>
        public int? PublicoAlvo { get; set; }

        public DateTime? DataEntrega { get; set; }
        public DateTime? DataValidade { get; set; }

        /// <summary>todos | ativo | baixo | a_vencer | sem_estoque</summary>
        public string? StatusEstoque { get; set; }
    }
}
