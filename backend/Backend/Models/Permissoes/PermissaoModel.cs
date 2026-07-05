using Backend.Models;

namespace Backend.Models.Permissoes;

public class PermissaoModel : BaseModel
{
    /// <summary>Identificador único legível (ex.: estoque.entrada).</summary>
    public string Codigo { get; set; } = string.Empty;

    public string Nome { get; set; } = string.Empty;

    public string? Descricao { get; set; }

    /// <summary>Agrupamento para exibição (Sistema, Usuários, Estoque, etc.).</summary>
    public string Categoria { get; set; } = string.Empty;

    /// <summary>
    /// Quando true, a permissão deve ser atribuída por unidade de estoque (Secretaria / Canil).
    /// </summary>
    public bool EscopoUnidadeEstoque { get; set; }

    /// <summary>Permissões de sistema não podem ser excluídas pelo catálogo.</summary>
    public bool EhSistema { get; set; }

    public ICollection<UsuarioPermissaoModel> Atribuicoes { get; set; } = [];
}
