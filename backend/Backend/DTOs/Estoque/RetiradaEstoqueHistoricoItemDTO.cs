namespace Backend.DTOs.Estoque;

public class RetiradaEstoqueHistoricoItemDTO
{
    public int Id { get; set; }

    public DateTime DataHoraRetirada { get; set; }

    public string Codigo { get; set; } = string.Empty;

    public string NomeProduto { get; set; } = string.Empty;

    public string Lote { get; set; } = string.Empty;

    public int Quantidade { get; set; }

    /// <summary>Quem realizou — nome exibível (prioriza cadastro vinculado se houver).</summary>
    public string UsuarioRetiranteExibicao { get; set; } = string.Empty;

    /// <summary>UsuarioId do retirante, quando há vínculo com cadastro.</summary>
    public int? IdUsuarioRetirante { get; set; }

    /// <summary>Quem recebeu — texto ou nome do usuário cadastrado.</summary>
    public string UsuarioRecebedorExibicao { get; set; } = string.Empty;

    public int? IdUsuarioRecebedor { get; set; }

    public string? Observacao { get; set; }

    public string Status { get; set; } = string.Empty;

    /// <summary>Indica que o lote estava vencido no momento da retirada (autorizada pelo retirante).</summary>
    public bool EstavaVencido { get; set; }

    /// <summary>Data de validade do lote retirado, quando aplicável.</summary>
    public DateTime? DataValidadeLote { get; set; }
}
