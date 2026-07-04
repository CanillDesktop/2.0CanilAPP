using Backend.DTOs.Estoque;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UnidadesEstoqueController : ControllerBase
{
    private readonly IUnidadeEstoqueContextService _unidadeContext;

    public UnidadesEstoqueController(IUnidadeEstoqueContextService unidadeContext)
    {
        _unidadeContext = unidadeContext;
    }

    [HttpGet("contexto")]
    [ProducesResponseType(typeof(ContextoUnidadeEstoqueDTO), StatusCodes.Status200OK)]
    public async Task<ActionResult<ContextoUnidadeEstoqueDTO>> ObterContexto(CancellationToken cancellationToken)
    {
        var contexto = await _unidadeContext.ObterContextoAsync(cancellationToken);
        return Ok(contexto);
    }
}
