using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Backend.Context;
using Backend.DTOs.CodigoAcesso;
using Backend.Exceptions;
using Backend.Models.CodigoAcesso;
using Backend.Models.Permissoes;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public partial class CodigoAcessoService : ICodigoAcessoService
{
    private const int ComprimentoMinimo = 4;
    private const int ComprimentoMaximo = 64;

    private readonly CanilAppDbContext _context;
    private readonly IPermissaoAuthorizationService _authorization;

    public CodigoAcessoService(CanilAppDbContext context, IPermissaoAuthorizationService authorization)
    {
        _context = context;
        _authorization = authorization;
    }

    public async Task<CodigoAcessoResponseDTO> ObterAsync(CancellationToken cancellationToken = default)
    {
        var registro = await ObterRegistroAsync(cancellationToken);
        return new CodigoAcessoResponseDTO
        {
            Codigo = registro.Codigo,
            AtualizadoEm = registro.DataHoraAtualizacao
        };
    }

    public async Task<CodigoAcessoResponseDTO> AtualizarAsync(string? codigo, string? editadoPor, CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.CodigoSegurancaEditar, cancellationToken: cancellationToken);

        var valor = (codigo ?? string.Empty).Trim();

        if (string.IsNullOrEmpty(valor))
            throw new RegraDeNegocioInfringidaException("Informe o código de acesso.");

        if (!FormatoValido(valor))
            throw new RegraDeNegocioInfringidaException("Formato do código inválido. Use de 4 a 64 caracteres, sem espaços.");

        var registro = await ObterRegistroAsync(cancellationToken);
        registro.Codigo = valor;
        registro.DataHoraAtualizacao = DateTime.UtcNow;
        registro.EditadoPor = string.IsNullOrWhiteSpace(editadoPor) ? "Administrador" : editadoPor;

        await _context.SaveChangesAsync(cancellationToken);

        return new CodigoAcessoResponseDTO
        {
            Codigo = registro.Codigo,
            AtualizadoEm = registro.DataHoraAtualizacao
        };
    }

    public async Task<bool> ValidarAsync(string? codigo, CancellationToken cancellationToken = default)
    {
        var valor = (codigo ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(valor))
            return false;

        var registro = await ObterRegistroAsync(cancellationToken);

        var informado = Encoding.UTF8.GetBytes(valor);
        var vigente = Encoding.UTF8.GetBytes(registro.Codigo);

        return CryptographicOperations.FixedTimeEquals(informado, vigente);
    }

    public async Task<string> ObterVersaoAsync(CancellationToken cancellationToken = default)
    {
        var registro = await ObterRegistroAsync(cancellationToken);
        return Versao(registro);
    }

    /// <summary>
    /// Identificador opaco que muda sempre que o código é alterado, sem revelar o valor.
    /// Baseado no instante da última atualização (não permite deduzir o código).
    /// </summary>
    private static string Versao(CodigoAcessoModel registro) =>
        registro.DataHoraAtualizacao.ToUniversalTime().Ticks.ToString(CultureInfo.InvariantCulture);

    private async Task<CodigoAcessoModel> ObterRegistroAsync(CancellationToken cancellationToken)
    {
        var registro = await _context.Set<CodigoAcessoModel>()
            .FirstOrDefaultAsync(c => c.Id == CodigoAcessoModel.IdRegistroUnico, cancellationToken);

        if (registro is null)
        {
            registro = new CodigoAcessoModel
            {
                Id = CodigoAcessoModel.IdRegistroUnico,
                Codigo = CodigoAcessoModel.CodigoPadrao,
                DataHoraAtualizacao = DateTime.UtcNow,
                EditadoPor = "Sistema"
            };
            _context.Set<CodigoAcessoModel>().Add(registro);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return registro;
    }

    private static bool FormatoValido(string valor)
    {
        if (valor.Length < ComprimentoMinimo || valor.Length > ComprimentoMaximo)
            return false;

        return RegexFormato().IsMatch(valor);
    }

    [GeneratedRegex(@"^\S+$")]
    private static partial Regex RegexFormato();
}
