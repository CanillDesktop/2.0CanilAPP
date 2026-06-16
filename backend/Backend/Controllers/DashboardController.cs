using Backend.DTOs.Dashboard;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service) => _service = service;

    [HttpGet("resumo")]
    public async Task<ActionResult<DashboardResumoDTO>> ObterResumo(CancellationToken cancellationToken)
    {
        return Ok(await _service.ObterResumoAsync(cancellationToken));
    }

    [HttpGet("alertas")]
    public async Task<ActionResult<DashboardAlertasPaginadosDTO>> ListarAlertas(
        [FromQuery] string tipo,
        [FromQuery] string? origem,
        [FromQuery] string? termo,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 5,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var resultado = await _service.ListarAlertasAsync(
                tipo,
                origem,
                termo,
                pageNumber,
                pageSize,
                cancellationToken);
            return Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
