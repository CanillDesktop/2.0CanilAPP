using Backend.DTOs.Permissoes;
using Backend.Exceptions;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PermissoesController : ControllerBase
{
    private readonly IPermissaoCatalogoService _catalogo;

    public PermissoesController(IPermissaoCatalogoService catalogo)
    {
        _catalogo = catalogo;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PermissaoLeituraDTO>>> Listar(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _catalogo.ListarAsync(cancellationToken));
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
    public async Task<ActionResult<PermissaoLeituraDTO>> Criar(
        [FromBody] PermissaoCadastroDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var criada = await _catalogo.CriarAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(Listar), new { id = criada.Id }, criada);
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Não foi possível criar a permissão",
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

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PermissaoLeituraDTO>> Atualizar(
        int id,
        [FromBody] PermissaoAtualizacaoDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _catalogo.AtualizarAsync(id, dto, cancellationToken));
        }
        catch (RecursoNaoEncontradoException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Permissão não encontrada",
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

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id, CancellationToken cancellationToken)
    {
        try
        {
            await _catalogo.ExcluirAsync(id, cancellationToken);
            return NoContent();
        }
        catch (RecursoNaoEncontradoException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Permissão não encontrada",
                Status = StatusCodes.Status404NotFound,
                Details = ex.Message,
            });
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Não foi possível excluir a permissão",
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
}
