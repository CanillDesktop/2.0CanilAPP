namespace Backend.DTOs.Cargos;

public class CargoLeituraDTO
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool EhAdministradorSistema { get; set; }
    public bool EhSistema { get; set; }
    public int TotalUsuarios { get; set; }
}

public class CargoCadastroDTO
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
}

public class CargoAtualizacaoDTO
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
}

public class CargoPermissaoAtribuicaoSalvarDTO
{
    public int IdPermissao { get; set; }
    public int? IdUnidadeEstoque { get; set; }
}

public class CargoPermissoesSalvarDTO
{
    public IReadOnlyList<CargoPermissaoAtribuicaoSalvarDTO> Atribuicoes { get; set; } = [];
}

public class CargoPermissaoAtribuicaoLinhaDTO
{
    public int IdPermissao { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public bool EscopoUnidadeEstoque { get; set; }
    public bool EhSistema { get; set; }
    public bool Atribuida { get; set; }
    public int? IdUnidadeEstoque { get; set; }
    public string? NomeUnidade { get; set; }
}

public class CargoPermissoesEditorDTO
{
    public int IdCargo { get; set; }
    public string NomeCargo { get; set; } = string.Empty;
    public bool EhAdministradorSistema { get; set; }
    public IReadOnlyList<CargoPermissaoAtribuicaoLinhaDTO> Linhas { get; set; } = [];
}
