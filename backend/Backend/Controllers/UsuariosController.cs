using Backend.DTOs.Usuario;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    private readonly IUsuariosService _usuariosService;

    public UsuariosController(IUsuariosService usuariosService)
    {
        _usuariosService = usuariosService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioResponseDTO>>> GetAll()
    {
        if (!EhAdmin())
            return Forbid();

        var usuarios = await _usuariosService.BuscarTodosAsync();
        return Ok(usuarios.Select(u => (UsuarioResponseDTO)u));
    }

    [Authorize]
    [HttpGet("{id}", Name = "GetUsuario")]
    public async Task<ActionResult<UsuarioResponseDTO>> GetById(int id)
    {
        var usuarioLogadoId = ObterUsuarioLogadoId();
        if (usuarioLogadoId == null)
            return Unauthorized();

        var ehAdmin = EhAdmin();
        if (!ehAdmin && usuarioLogadoId.Value != id)
            return Forbid();

        var usuario = await _usuariosService.BuscarPorIdAsync(id);
        if (usuario == null)
            return NotFound(new { error = "Usuário não encontrado." });

        return Ok((UsuarioResponseDTO)usuario);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioResponseDTO>> Create([FromBody] UsuarioCriacaoComConfirmacaoRequestDTO dto)
    {
        var autenticado = User?.Identity?.IsAuthenticated == true;
        var permissaoCriacao = PermissoesEnum.LEITURA;

        if (autenticado)
        {
            if (!EhAdmin())
                return Forbid();

            var usuarioLogadoId = ObterUsuarioLogadoId();
            if (usuarioLogadoId == null)
                return Unauthorized();

            var senhaConfirmada = await _usuariosService.ConfirmarSenhaUsuarioAsync(
                usuarioLogadoId.Value,
                dto.SenhaConfirmacao ?? string.Empty
            );
            if (!senhaConfirmada)
                return Unauthorized(new { error = "Senha de confirmação inválida." });

            permissaoCriacao = dto.Permissao;
        }

        try
        {
            var request = new UsuarioRequestDTO
            {
                PrimeiroNome = dto.PrimeiroNome,
                Sobrenome = dto.Sobrenome,
                Email = dto.Email,
                Senha = dto.Senha,
                Permissao = permissaoCriacao
            };
            var novoUsuario = await _usuariosService.CriarAsync(request);

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

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioResponseDTO>> Update(int id, [FromBody] UsuarioAtualizacaoRequestDTO dto)
    {
        var usuarioLogadoId = ObterUsuarioLogadoId();
        if (usuarioLogadoId == null)
            return Unauthorized();

        var ehAdmin = EhAdmin();
        if (!ehAdmin && usuarioLogadoId.Value != id)
            return Forbid();

        PermissoesEnum? novaPermissao = null;
        if (ehAdmin && usuarioLogadoId.Value != id && dto.Permissao.HasValue)
            novaPermissao = dto.Permissao;

        var atualizado = await _usuariosService.AtualizarDadosBasicosAsync(id, dto.PrimeiroNome, dto.Sobrenome, novaPermissao);
        if (atualizado == null)
            return NotFound(new { error = "Usuário não encontrado." });

        return Ok((UsuarioResponseDTO)atualizado);
    }

    [Authorize]
    [HttpPatch("{id}/inativar")]
    public async Task<IActionResult> Inativar(int id, [FromBody] ConfirmacaoSenhaRequestDTO dto)
    {
        if (!EhAdmin())
            return Forbid();

        var usuarioLogadoId = ObterUsuarioLogadoId();
        if (usuarioLogadoId == null)
            return Unauthorized();
        if (usuarioLogadoId.Value == id)
            return BadRequest(new { error = "Não é permitido inativar o próprio usuário." });

        var senhaConfirmada = await _usuariosService.ConfirmarSenhaUsuarioAsync(usuarioLogadoId.Value, dto.SenhaConfirmacao);
        if (!senhaConfirmada)
            return Unauthorized(new { error = "Senha de confirmação inválida." });

        var inativado = await _usuariosService.InativarAsync(id);
        if (!inativado)
            return NotFound(new { error = "Usuário não encontrado." });

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, [FromBody] ConfirmacaoSenhaRequestDTO dto)
    {
        if (!EhAdmin())
            return Forbid();

        var usuarioLogadoId = ObterUsuarioLogadoId();
        if (usuarioLogadoId == null)
            return Unauthorized();
        if (usuarioLogadoId.Value == id)
            return BadRequest(new { error = "Não é permitido remover o próprio usuário." });

        var senhaConfirmada = await _usuariosService.ConfirmarSenhaUsuarioAsync(usuarioLogadoId.Value, dto.SenhaConfirmacao);
        if (!senhaConfirmada)
            return Unauthorized(new { error = "Senha de confirmação inválida." });

        var removido = await _usuariosService.DeletarAsync(id);
        if (!removido)
            return NotFound(new { error = "Usuário não encontrado." });

        return NoContent();
    }

    private int? ObterUsuarioLogadoId()
    {
        var claimId = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimId, out var id) ? id : null;
    }

    private bool EhAdmin()
    {
        var claimPermissao = User.FindFirstValue("permissao");
        return int.TryParse(claimPermissao, out var permissao) && permissao == (int)PermissoesEnum.ADMIN;
    }
}
