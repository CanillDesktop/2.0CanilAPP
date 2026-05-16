namespace Backend.DTOs.Usuario;

public class UsuarioResumoFiltroDTO
{
    public int Id { get; set; }

    /// <summary>Nome já formatado para exibição.</summary>
    public string NomeExibicao { get; set; } = string.Empty;
}
