using Backend.DTOs.UnidadeMedida;
using Backend.Exceptions;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UnidadesMedidaController : ControllerBase
{
    private readonly IUnidadeMedidaService _service;

    public UnidadesMedidaController(IUnidadeMedidaService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lista unidades de medida. Use <paramref name="aplicavelA"/> = produto|medicamento|insumo
    /// para filtrar no cadastro de itens.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UnidadeMedidaDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<UnidadeMedidaDTO>>> Listar(
        [FromQuery] string? aplicavelA = null,
        [FromQuery] bool apenasAtivas = true,
        CancellationToken cancellationToken = default)
    {
        TipoItemUnidadeMedida? tipo = null;
        if (!string.IsNullOrWhiteSpace(aplicavelA))
        {
            if (!TryParseTipo(aplicavelA, out var parsed))
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Dados inválidos",
                    Status = StatusCodes.Status400BadRequest,
                    Details = "aplicavelA deve ser produto, medicamento ou insumo.",
                });
            }

            tipo = parsed;
        }

        var itens = await _service.ListarAsync(tipo, apenasAtivas, cancellationToken);
        return Ok(itens);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UnidadeMedidaDTO), StatusCodes.Status200OK)]
    public async Task<ActionResult<UnidadeMedidaDTO>> ObterPorId(int id, CancellationToken cancellationToken)
    {
        var item = await _service.ObterPorIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Recurso não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = "Unidade de medida não encontrada.",
            });
        }

        return Ok(item);
    }

    [HttpPost]
    [ProducesResponseType(typeof(UnidadeMedidaDTO), StatusCodes.Status201Created)]
    public async Task<ActionResult<UnidadeMedidaDTO>> Criar(
        [FromBody] UnidadeMedidaCadastroDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var criado = await _service.CriarAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(ObterPorId), new { id = criado.Id }, criado);
        }
        catch (AcessoNegadoException ex)
        {
            return StatusCode(ex.StatusCode, new ErrorResponse
            {
                Title = ex.Titulo,
                Status = ex.StatusCode,
                Details = ex.Message,
            });
        }
        catch (ModelIncompletaException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Dados inválidos",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message,
            });
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Regra de negócio",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message,
            });
        }
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(UnidadeMedidaDTO), StatusCodes.Status200OK)]
    public async Task<ActionResult<UnidadeMedidaDTO>> Atualizar(
        int id,
        [FromBody] UnidadeMedidaAtualizacaoDTO dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var atualizado = await _service.AtualizarAsync(id, dto, cancellationToken);
            return Ok(atualizado);
        }
        catch (AcessoNegadoException ex)
        {
            return StatusCode(ex.StatusCode, new ErrorResponse
            {
                Title = ex.Titulo,
                Status = ex.StatusCode,
                Details = ex.Message,
            });
        }
        catch (ArgumentNullException ex)
        {
            return NotFound(new ErrorResponse
            {
                Title = "Recurso não encontrado",
                Status = StatusCodes.Status404NotFound,
                Details = ex.Message ?? "Unidade de medida não encontrada.",
            });
        }
        catch (ModelIncompletaException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Dados inválidos",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message,
            });
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Regra de negócio",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message,
            });
        }
    }

    private static bool TryParseTipo(string valor, out TipoItemUnidadeMedida tipo)
    {
        tipo = default;
        switch (valor.Trim().ToLowerInvariant())
        {
            case "produto":
            case "produtos":
                tipo = TipoItemUnidadeMedida.Produto;
                return true;
            case "medicamento":
            case "medicamentos":
                tipo = TipoItemUnidadeMedida.Medicamento;
                return true;
            case "insumo":
            case "insumos":
                tipo = TipoItemUnidadeMedida.Insumo;
                return true;
            default:
                return false;
        }
    }
}
