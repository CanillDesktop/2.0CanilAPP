namespace Backend.DTOs.Estoque;

public class UnidadeEstoqueDTO
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Sigla { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public bool Ativa { get; set; }
}

public class UsuarioUnidadeEstoqueDTO
{
    public int IdUnidadeEstoque { get; set; }
    public string NomeUnidade { get; set; } = string.Empty;
    public string SiglaUnidade { get; set; } = string.Empty;
    public bool PodeConsultar { get; set; }
    public bool PodeEntrada { get; set; }
    public bool PodeSaida { get; set; }
    public bool PodeTransferirEnviar { get; set; }
    public bool PodeTransferirReceber { get; set; }
}

public class UsuarioUnidadeEstoqueAtribuicaoDTO
{
    public int IdUnidadeEstoque { get; set; }
    public bool PodeConsultar { get; set; } = true;
    public bool PodeEntrada { get; set; }
    public bool PodeSaida { get; set; }
    public bool PodeTransferirEnviar { get; set; }
    public bool PodeTransferirReceber { get; set; }
}

public class ContextoUnidadeEstoqueDTO
{
    public int UnidadeAtivaId { get; set; }
    public string UnidadeAtivaNome { get; set; } = string.Empty;
    public string UnidadeAtivaSigla { get; set; } = string.Empty;
    public IReadOnlyList<UnidadeEstoqueDTO> UnidadesDisponiveis { get; set; } = [];
}
