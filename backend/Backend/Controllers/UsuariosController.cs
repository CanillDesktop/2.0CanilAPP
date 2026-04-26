using Backend.DTOs.Usuario;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    private readonly IUsuariosService _service;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(IUsuariosService service, ILogger<UsuariosController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioResponseDTO>>> Get()
    {
        var usuarios = await _service.BuscarTodosAsync();

        return Ok(usuarios);
    }

    [Authorize]
    [HttpGet("{id}", Name = "GetUsuario")]
    public async Task<ActionResult<UsuarioResponseDTO>> GetById(int id)
    {
        var usuario = await _service.BuscarPorIdAsync(id);
        if (usuario == null)
            return NotFound(new ErrorResponse
            {
                Title = "Usuário não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = "Usuário não encontrado"
            });

        return Ok(usuario);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioResponseDTO>> Create([FromBody] UsuarioRequestDTO dto)
    {
        try
        {
            var novoUsuario = await _service.CriarAsync(dto);

            if (novoUsuario == null)
                throw new ArgumentNullException();

            return new CreatedAtRouteResult("GetUsuario",
                new { id = novoUsuario.Id }, novoUsuario);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Erro ao criar usuário",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message ?? "Erro ao criar usuário"
                    }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioResponseDTO>> Put([FromRoute] int id, [FromBody] UsuarioRequestDTO dto)
    {
        try
        {
            var usuarioAtualizado = await _service.AtualizarAsync(id, dto);

            return Ok(usuarioAtualizado);
        }
        catch (ArgumentNullException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Recurso não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = ex.Message ?? "Usuário não encontrado"
            });
        }
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool hardDelete = false)
    {
        var sucesso = await _service.DeletarAsync(id, hardDelete);
        if (!sucesso)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Recurso não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = $"Usuário de id {id} não encontrado"
            });
            });

        return NoContent();
    }
}
