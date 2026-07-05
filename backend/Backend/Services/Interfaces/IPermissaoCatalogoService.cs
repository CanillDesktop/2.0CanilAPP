using Backend.DTOs.Permissoes;

namespace Backend.Services.Interfaces;

public interface IPermissaoCatalogoService
{
    Task<IReadOnlyList<PermissaoLeituraDTO>> ListarAsync(CancellationToken cancellationToken = default);
    Task<PermissaoLeituraDTO> CriarAsync(PermissaoCadastroDTO dto, CancellationToken cancellationToken = default);
    Task<PermissaoLeituraDTO> AtualizarAsync(int id, PermissaoAtualizacaoDTO dto, CancellationToken cancellationToken = default);
    Task ExcluirAsync(int id, CancellationToken cancellationToken = default);
}
