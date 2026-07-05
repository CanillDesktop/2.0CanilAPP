using Backend.Models.Estoque;
using Backend.Models.Usuarios;

namespace Backend.Models.Permissoes;

public class UsuarioPermissaoModel
{
    public int Id { get; set; }

    public int IdUsuario { get; set; }

    public int IdPermissao { get; set; }

    /// <summary>Nulo para permissões globais; preenchido para Secretaria/Canil.</summary>
    public int? IdUnidadeEstoque { get; set; }

    public UsuariosModel? Usuario { get; set; }

    public PermissaoModel? Permissao { get; set; }

    public UnidadeEstoqueModel? UnidadeEstoque { get; set; }
}
