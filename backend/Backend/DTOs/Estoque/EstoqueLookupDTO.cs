namespace Backend.DTOs.Estoque;

/// <summary>Projeção enxuta para seleção de item em formulários operacionais.</summary>
public class ItemEstoqueLookupLeituraDTO
{
    public int Id { get; set; }

    public string Codigo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    /// <summary>Soma de quantidades dos lotes ativos na unidade consultada.</summary>
    public int Saldo { get; set; }

    public EstoqueOrigem Origem { get; set; }
}

/// <summary>Projeção enxuta para seleção de lote de um item já escolhido.</summary>
public class LoteEstoqueLookupLeituraDTO
{
    public string Lote { get; set; } = string.Empty;

    public int Saldo { get; set; }

    public DateTime? Validade { get; set; }

    /// <summary>Data de entrada/recebimento do lote (não há campo de fabricação no domínio).</summary>
    public DateTime DataEntrega { get; set; }

    /// <summary>ok | proximo_vencimento | vencido</summary>
    public string Status { get; set; } = "ok";
}

public class EstoqueLookupItensFiltroDTO
{
    /// <summary>ID, código ou descrição. Mínimo 2 caracteres, exceto busca exata por ID numérico.</summary>
    public string? Texto { get; set; }
}

public class EstoqueLookupLotesFiltroDTO
{
    public int ItemId { get; set; }

    /// <summary>Filtro parcial pelo número do lote.</summary>
    public string? Texto { get; set; }

    /// <summary>validade | saldo | lote</summary>
    public string? OrderBy { get; set; }

    /// <summary>asc | desc</summary>
    public string? SortDirection { get; set; }
}
