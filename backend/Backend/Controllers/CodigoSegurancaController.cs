using Backend.DTOs.CodigoAcesso;
using Backend.Exceptions;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CodigoSegurancaController : ControllerBase
{
    private readonly ICodigoAcessoService _service;
    private readonly IUserSessionService _userSession;

    public CodigoSegurancaController(ICodigoAcessoService service, IUserSessionService userSession)
    {
        _service = service;
        _userSession = userSession;
    }

    /// <summary>Valida o código de acesso no pré-login (primeiro acesso). Anônimo e limitado por taxa.</summary>
    [AllowAnonymous]
    [EnableRateLimiting("codigo-acesso")]
    [HttpPost("validar")]
    public async Task<ActionResult<ValidarCodigoAcessoResponseDTO>> Validar(
        [FromBody] ValidarCodigoAcessoRequestDTO? dto,
        CancellationToken cancellationToken)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Codigo))
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Dados inválidos",
                Status = StatusCodes.Status400BadRequest,
                Details = "Informe o código de acesso."
            });
        }

        var valido = await _service.ValidarAsync(dto.Codigo, cancellationToken);
        var versao = await _service.ObterVersaoAsync(cancellationToken);
        return Ok(new ValidarCodigoAcessoResponseDTO { Valido = valido, Versao = versao });
    }

    /// <summary>Versão atual do código de acesso (anônimo). Permite ao cliente saber se o código mudou.</summary>
    [AllowAnonymous]
    [HttpGet("versao")]
    public async Task<ActionResult<VersaoCodigoAcessoResponseDTO>> ObterVersao(CancellationToken cancellationToken)
    {
        var versao = await _service.ObterVersaoAsync(cancellationToken);
        return Ok(new VersaoCodigoAcessoResponseDTO { Versao = versao });
    }

    /// <summary>Consulta o código de acesso vigente (qualquer usuário autenticado).</summary>
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<CodigoAcessoResponseDTO>> Obter(CancellationToken cancellationToken)
    {
        var dto = await _service.ObterAsync(cancellationToken);
        return Ok(dto);
    }

    /// <summary>Altera o código de acesso (requer permissão codigo_seguranca.editar).</summary>
    [Authorize]
    [HttpPut]
    public async Task<ActionResult<CodigoAcessoResponseDTO>> Atualizar(
        [FromBody] AtualizarCodigoAcessoRequestDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var atualizado = await _service.AtualizarAsync(dto?.Codigo, _userSession.EditedBy, cancellationToken);
            return Ok(atualizado);
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Falha ao atualizar código de acesso",
                Status = StatusCodes.Status422UnprocessableEntity,
                Details = ex.Message
            });
        }
    }
}
