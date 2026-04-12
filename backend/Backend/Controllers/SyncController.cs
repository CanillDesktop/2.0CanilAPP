using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend.Controllers;

/// <summary>
/// Mantido para compatibilidade com o app: não há mais sincronização com nuvem externa.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SyncController : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("sync-policy")]
    public IActionResult Sincronizar()
    {
        return Ok(new { message = "Sincronização não necessária: dados apenas no SQLite (servidor)." });
    }

    [HttpPost("limpar")]
    public IActionResult Limpar()
    {
        return Ok(new { message = "Nada a limpar." });
    }
}
