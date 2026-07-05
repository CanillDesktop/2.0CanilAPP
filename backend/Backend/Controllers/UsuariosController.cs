using Backend.DTOs.Common;
using Backend.DTOs.Permissoes;
using Backend.DTOs.Usuario;
using Backend.Exceptions;
using Backend.DTOs.Estoque;
using Backend.Models;
using Backend.Pagination;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    private readonly IUsuariosService _service;
    private readonly IUsuarioPermissaoAtribuicaoService _permissoesAtribuicao;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(
        IUsuariosService service,
        IUsuarioPermissaoAtribuicaoService permissoesAtribuicao,
        ILogger<UsuariosController> logger)
    {
        _service = service;
        _permissoesAtribuicao = permissoesAtribuicao;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("resumo-filtro-retiradas")]
    public async Task<ActionResult<IReadOnlyList<UsuarioResumoFiltroDTO>>> GetResumoFiltroRetiradas(
        CancellationToken cancellationToken)
    {
        var dados = await _service.ListarResumoParaFiltrosHistoricoRetiradasAsync(cancellationToken);
        return Ok(dados);
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<UsuarioResponseDTO>>> Get(
        [FromQuery] UsuarioListagemParameters parameters,
        CancellationToken cancellationToken)
    {
        var resultado = await _service.ListarPaginadoAsync(parameters, cancellationToken);
        return Ok(resultado);
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

    [Authorize]
    [HttpGet("{id}/unidades-estoque")]
    public async Task<ActionResult<IReadOnlyList<UsuarioUnidadeEstoqueDTO>>> GetUnidadesEstoque(int id, CancellationToken cancellationToken)
    {
        var unidades = await _service.ObterUnidadesEstoqueAsync(id, cancellationToken);
        return Ok(unidades);
    }

    [Authorize]
    [HttpGet("{id}/permissoes-atribuicoes")]
    public async Task<ActionResult<UsuarioPermissoesEditorDTO>> GetPermissoesAtribuicoes(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _permissoesAtribuicao.ObterEditorAsync(id, cancellationToken));
        }
        catch (RecursoNaoEncontradoException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Usuário não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = ex.Message,
            });
        }
        catch (AcessoNegadoException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ErrorResponse
            {
                Title = "Acesso negado",
                Status = StatusCodes.Status403Forbidden,
                Details = ex.Message,
            });
        }
    }

    [Authorize]
    [HttpPut("{id}/permissoes-atribuicoes")]
    public async Task<IActionResult> PutPermissoesAtribuicoes(
        int id,
        [FromBody] UsuarioPermissoesSalvarDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            await _permissoesAtribuicao.SalvarAsync(id, dto, cancellationToken);
            return NoContent();
        }
        catch (RecursoNaoEncontradoException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Usuário não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = ex.Message,
            });
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Não foi possível salvar as permissões",
                Status = StatusCodes.Status422UnprocessableEntity,
                Details = ex.Message,
            });
        }
        catch (AcessoNegadoException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ErrorResponse
            {
                Title = "Acesso negado",
                Status = StatusCodes.Status403Forbidden,
                Details = ex.Message,
            });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioResponseDTO>> Create([FromBody] UsuarioCriacaoComConfirmacaoRequestDTO dto)
    {
        try
        {
            var novoUsuario = await _service.CriarAsync(dto);

            if (novoUsuario == null)
                throw new ArgumentNullException();

            return new CreatedAtRouteResult("GetUsuario",
                new { id = novoUsuario.Id }, novoUsuario);
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Erro ao criar usuário",
                Status = StatusCodes.Status422UnprocessableEntity,
                Details = ex.Message ?? "Erro ao criar usuário"
            });
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioResponseDTO>> Put([FromRoute] int id, [FromBody] AtualizarUsuarioRequestDTO dto)
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
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Falha ao atualizar usuário",
                Status = StatusCodes.Status422UnprocessableEntity,
                Details = ex.Message ?? "Falha ao atualizar usuário"
            });
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        int id,
        [FromQuery] bool hardDelete = false,
        [FromBody] ConfirmacaoSenhaRequestDTO? dto = null)
    {
        try
        {
            var sucesso = await _service.DeletarAsync(id, dto?.SenhaConfirmacao ?? string.Empty, hardDelete);
            if (!sucesso)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = $"Usuário de id {id} não encontrado"
                });
            }

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Falha ao excluir usuário",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message ?? "Falha ao excluir usuário"
            });
        }
    }

    [Authorize]
    [HttpPatch("{id}/alterar-senha")]
    public async Task<IActionResult> AlterarSenha(int id, [FromBody] TrocarSenhaRequestDTO dto)
    {
        try
        {
            await _service.TrocarSenhaAsync(id, dto.SenhaAtual, dto.NovaSenha);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Falha ao alterar senha",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message ?? "Falha ao alterar senha"
            });
        }
        catch (AcessoNegadoException ex)
        {
            return StatusCode(ex.StatusCode, new ErrorResponse
            {
                Title = ex.Titulo,
                Status = ex.StatusCode,
                Details = ex.Message
            });
        }
    }

    [Authorize]
    [HttpPatch("{id}/inativar")]
    public async Task<IActionResult> Inativar(int id, [FromBody] ConfirmacaoSenhaRequestDTO dto)
    {
        try
        {
            var result = await _service.InativarAsync(id, dto.SenhaConfirmacao);
            if (result != true)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Falha ao inativar usuário",
                    Status = StatusCodes.Status404NotFound,
                    Details = "Usuário não encontrado"
                });
            }

            return NoContent();
        }
        catch (ArgumentNullException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Usuário não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = ex.Message ?? "Usuário não encontrado"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Falha ao alterar status do usuário",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message ?? "Falha ao alterar status do usuário"
            });
        }
        catch (ConflitoDeNegocioException ex)
        {
            return Conflict(new ErrorResponse
            {
                Title = "Não é possível alterar o status do usuário",
                Status = StatusCodes.Status409Conflict,
                Details = ex.Message ?? "Não é possível alterar o status do usuário"
            });
        }
    }

    [Authorize]
    [HttpPatch("{id}/reativar")]
    public async Task<IActionResult> Reativar(int id, [FromBody] ConfirmacaoSenhaRequestDTO dto)
    {
        try
        {
            var result = await _service.ReativarAsync(id, dto.SenhaConfirmacao);
            if (result != true)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Falha ao reativar usuário",
                    Status = StatusCodes.Status404NotFound,
                    Details = "Usuário não encontrado"
                });
            }

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Falha ao reativar usuário",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message ?? "Falha ao reativar usuário"
            });
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Falha ao reativar usuário",
                Status = StatusCodes.Status422UnprocessableEntity,
                Details = ex.Message
            });
        }
    }
}
