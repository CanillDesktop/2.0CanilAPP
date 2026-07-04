namespace Backend.Pagination;

public class UsuarioListagemParameters : PaginationParameters
{
    /// <summary>ativo | inativo | excluido | todos (ativo + inativo, sem excluídos)</summary>
    public string Status { get; set; } = "ativo";

    public string? Busca { get; set; }

    public string NormalizedStatus => string.IsNullOrWhiteSpace(Status)
        ? "ativo"
        : Status.Trim().ToLowerInvariant();
}
