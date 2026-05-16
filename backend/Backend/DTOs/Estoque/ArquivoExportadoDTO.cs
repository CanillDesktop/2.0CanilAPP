namespace Backend.DTOs.Estoque;

public sealed class ArquivoExportadoDTO
{
    public required byte[] Conteudo { get; init; }

    public required string NomeArquivo { get; init; }

    public required string ContentType { get; init; }
}
