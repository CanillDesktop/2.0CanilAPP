using Backend.DTOs.Usuario;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    private readonly IUsuariosService _usuariosService;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(IUsuariosService usuariosService, ILogger<UsuariosController> logger)
    {
        _usuariosService = usuariosService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("{id}", Name = "GetUsuario")]
    public async Task<ActionResult<UsuarioResponseDTO>> GetById(int id)
    {
        var usuario = await _usuariosService.BuscarPorIdAsync(id);
        if (usuario == null)
            return NotFound(new { error = "Usuário não encontrado." });

        return Ok(usuario);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioResponseDTO>> Create([FromBody] UsuarioRequestDTO dto)
    {
        try
        {
            var novoUsuario = await _usuariosService.CriarAsync(dto);

            if (novoUsuario == null)
                throw new ArgumentNullException();

            return new CreatedAtRouteResult("GetUsuario",
                new { id = novoUsuario.Id }, novoUsuario);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
