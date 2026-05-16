using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models;
using Backend.Pagination;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class RetiradaEstoqueController : ControllerBase
{
    private readonly IRetiradaEstoqueService _service;
    private readonly IRetiradaEstoqueHistoricoExportService _exportService;

    public RetiradaEstoqueController(
        IRetiradaEstoqueService service,
        IRetiradaEstoqueHistoricoExportService exportService)
    {
        _service = service;
        _exportService = exportService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RetiradaEstoqueDTO>>> Get()
    {
        var logRetiradas = await _service.BuscarTodosAsync();
        return Ok(logRetiradas);
    }

    [HttpGet("historico")]
    public async Task<ActionResult<RetiradaEstoqueHistoricoListaPaginadaDTO>> GetHistorico(
        [FromQuery] RetiradaEstoqueFiltroDTO? filtro,
        [FromQuery] RetiradaEstoqueParameters? parameters,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _service.ConsultarHistoricoPaginadoAsync(
                filtro ?? new RetiradaEstoqueFiltroDTO(),
                parameters ?? new RetiradaEstoqueParameters(),
                cancellationToken);

            return Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Filtros inválidos",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message,
            });
        }
    }

    [HttpGet("historico/exportar/xlsx")]
    public async Task<IActionResult> ExportarHistoricoXlsx(
        [FromQuery] RetiradaEstoqueFiltroDTO? filtro,
        [FromQuery] bool ordemDataAscendente = false,
        CancellationToken cancellationToken = default) =>
        await ExportarHistoricoInternoAsync(
            () => _exportService.ExportarHistoricoXlsxAsync(
                filtro ?? new RetiradaEstoqueFiltroDTO(),
                ordemDataAscendente,
                cancellationToken));

    [HttpGet("historico/exportar/csv")]
    public async Task<IActionResult> ExportarHistoricoCsv(
        [FromQuery] RetiradaEstoqueFiltroDTO? filtro,
        [FromQuery] bool ordemDataAscendente = false,
        CancellationToken cancellationToken = default) =>
        await ExportarHistoricoInternoAsync(
            () => _exportService.ExportarHistoricoCsvAsync(
                filtro ?? new RetiradaEstoqueFiltroDTO(),
                ordemDataAscendente,
                cancellationToken));

    private async Task<IActionResult> ExportarHistoricoInternoAsync(
        Func<Task<ArquivoExportadoDTO>> gerar)
    {
        try
        {
            var arquivo = await gerar();
            return File(arquivo.Conteudo, arquivo.ContentType, arquivo.NomeArquivo);
        }
        catch (ExportacaoRetiradasLimiteExcedidoException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Recorte muito grande para exportação",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message,
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Filtros inválidos",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message,
            });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
            {
                Title = "Falha ao gerar arquivo de exportação",
                Status = StatusCodes.Status500InternalServerError,
                Details = ex.Message,
            });
        }
    }

    [HttpPost("{lote}")]
    public async Task<IActionResult> Create(string lote, [FromBody] RetiradaEstoqueDTO dto)
    {
        try
        {
            var logRetirada = await _service.CriarAsync(lote, dto);

            if (logRetirada == null)
                throw new ArgumentNullException();

            return Created();
        }
        catch (ModelIncompletaException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Falha ao salvar log de retirada de estoque",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message ?? "Falha ao salvar log de retirada de estoque",
            });
        }
        catch (ArgumentNullException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Falha ao salvar log de retirada de estoque",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message ?? "Item de estoque não encontrado",
            });
        }
        catch (RegraDeNegocioInfringidaException ex)
        {
            return UnprocessableEntity(new ErrorResponse
            {
                Title = "Falha ao salvar log de retirada de estoque",
                Status = StatusCodes.Status422UnprocessableEntity,
                Details = ex.Message ?? "Quantidade de retirada maior que quantidade no estoque",
            });
        }
    }
}
