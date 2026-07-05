namespace Backend.DTOs.Permissoes;

public class PermissaoLeituraDTO
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public bool EscopoUnidadeEstoque { get; set; }
    public bool EhSistema { get; set; }
}

public class PermissaoCadastroDTO
{
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public bool EscopoUnidadeEstoque { get; set; }
}

public class PermissaoAtualizacaoDTO
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Categoria { get; set; } = string.Empty;
}

public class UsuarioPermissaoAtribuicaoDTO
{
    public string CodigoPermissao { get; set; } = string.Empty;
    public int? IdUnidadeEstoque { get; set; }
}

public class UsuarioPermissoesResumoDTO
{
    public IReadOnlyList<string> CodigosGlobais { get; set; } = [];
    public IReadOnlyList<UsuarioPermissaoUnidadeDTO> PorUnidade { get; set; } = [];
}

public class UsuarioPermissaoUnidadeDTO
{
    public int IdUnidadeEstoque { get; set; }
    public string SiglaUnidade { get; set; } = string.Empty;
    public IReadOnlyList<string> Codigos { get; set; } = [];
}

public class PermissaoAtribuicaoLinhaDTO
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

public class UsuarioPermissoesEditorDTO
{
    public int IdUsuario { get; set; }
    public IReadOnlyList<PermissaoAtribuicaoLinhaDTO> Linhas { get; set; } = [];
}

public class UsuarioPermissoesSalvarDTO
{
    public IReadOnlyList<UsuarioPermissaoAtribuicaoSalvarDTO> Atribuicoes { get; set; } = [];
}

public class UsuarioPermissaoAtribuicaoSalvarDTO
{
    public int IdPermissao { get; set; }
    public int? IdUnidadeEstoque { get; set; }
}
