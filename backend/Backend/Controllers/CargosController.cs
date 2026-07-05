using Backend.DTOs.Cargos;
using Backend.Exceptions;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CargosController : ControllerBase
{
    private readonly ICargoService _cargos;
    private readonly ICargoPermissaoAtribuicaoService _permissoes;

    public CargosController(ICargoService cargos, ICargoPermissaoAtribuicaoService permissoes)
    {
        _cargos = cargos;
        _permissoes = permissoes;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CargoLeituraDTO>>> Listar(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _cargos.ListarAsync(cancellationToken));
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
    public async Task<ActionResult<CargoLeituraDTO>> Criar(
        [FromBody] CargoCadastroDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _cargos.CriarAsync(dto, cancellationToken));
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Não foi possível criar o cargo",
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

    [HttpPut("{id}")]
    public async Task<ActionResult<CargoLeituraDTO>> Atualizar(
        int id,
        [FromBody] CargoAtualizacaoDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _cargos.AtualizarAsync(id, dto, cancellationToken));
        }
        catch (RecursoNaoEncontradoException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Cargo não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = ex.Message,
            });
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Não foi possível atualizar o cargo",
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id, CancellationToken cancellationToken)
    {
        try
        {
            await _cargos.ExcluirAsync(id, cancellationToken);
            return NoContent();
        }
        catch (RecursoNaoEncontradoException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Cargo não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = ex.Message,
            });
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Não foi possível excluir o cargo",
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

    [HttpGet("{id}/permissoes")]
    public async Task<ActionResult<CargoPermissoesEditorDTO>> ObterPermissoes(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _permissoes.ObterEditorAsync(id, cancellationToken));
        }
        catch (RecursoNaoEncontradoException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Cargo não encontrado",
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

    [HttpPut("{id}/permissoes")]
    public async Task<IActionResult> SalvarPermissoes(
        int id,
        [FromBody] CargoPermissoesSalvarDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            await _permissoes.SalvarAsync(id, dto, cancellationToken);
            return NoContent();
        }
        catch (RecursoNaoEncontradoException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Cargo não encontrado",
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
}
