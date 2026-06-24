namespace Backend.Models.Estoque;

public class UnidadeEstoqueModel : BaseModel
{
    public string Nome { get; set; } = string.Empty;
    public string Sigla { get; set; } = string.Empty;
    public string Tipo { get; set; } = "OPERACIONAL";
    public bool Ativa { get; set; } = true;
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

    public ICollection<UsuarioUnidadeEstoqueModel> Usuarios { get; set; } = [];
}
