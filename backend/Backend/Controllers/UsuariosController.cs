using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    private readonly IUsuariosService<UsuarioResponseDTO> _usuariosService;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(IUsuariosService<UsuarioResponseDTO> usuariosService, ILogger<UsuariosController> logger)
    {
        _usuariosService = usuariosService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioResponseDTO>> Create([FromBody] UsuarioRequestDTO dto)
    {
        try
        {
            var usuario = await _usuariosService.CriarAsync(dto);
            if (usuario == null)
                return StatusCode(500, new { error = "Erro ao criar usuário" });
            return Ok(usuario);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar usuário");
            return StatusCode(500, new { error = "Erro ao criar usuário" });
        }
    }
}
