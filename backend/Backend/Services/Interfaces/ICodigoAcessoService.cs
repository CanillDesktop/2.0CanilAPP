using Backend.DTOs.CodigoAcesso;

namespace Backend.Services.Interfaces;

public interface ICodigoAcessoService
{
    /// <summary>Obtém o código de acesso atual (uso administrativo).</summary>
    Task<CodigoAcessoResponseDTO> ObterAsync(CancellationToken cancellationToken = default);

    /// <summary>Altera o código de acesso. Lança exceção de regra de negócio se o formato for inválido.</summary>
    Task<CodigoAcessoResponseDTO> AtualizarAsync(string? codigo, string? editadoPor, CancellationToken cancellationToken = default);

    /// <summary>Compara o código informado com o código vigente, de forma resistente a timing.</summary>
    Task<bool> ValidarAsync(string? codigo, CancellationToken cancellationToken = default);

    /// <summary>Versão opaca do código vigente; muda a cada alteração, sem expor o valor.</summary>
    Task<string> ObterVersaoAsync(CancellationToken cancellationToken = default);
}
