using Backend.Models.Usuarios;

namespace Backend.Models.Estoque;

public class UsuarioUnidadeEstoqueModel
{
    public int IdUsuario { get; set; }
    public int IdUnidadeEstoque { get; set; }
    public bool PodeConsultar { get; set; } = true;
    public bool PodeEntrada { get; set; }
    public bool PodeSaida { get; set; }
    public bool PodeTransferirEnviar { get; set; }
    public bool PodeTransferirReceber { get; set; }

    public UsuariosModel? Usuario { get; set; }
    public UnidadeEstoqueModel? UnidadeEstoque { get; set; }
}
