namespace Backend.DTOs.Estoque
{
    /// <summary>
    /// Lote gerado pelo backend (via LoteGeradorService) para um item específico.
    /// Usado pela tela de cadastro de lote apenas para conferência: o usuário não edita estes valores.
    /// </summary>
    public class ProximoLoteEstoqueDTO
    {
        public string Codigo { get; set; } = string.Empty;
        public string Lote { get; set; } = string.Empty;
    }
}
