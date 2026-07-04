using Backend.DTOs;
using Backend.DTOs.Estoque;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TransferenciasEstoqueController : ControllerBase
{
    private readonly ITransferenciaEstoqueService _service;
    private readonly ITransferenciaEstoqueExportService _exportService;

    public TransferenciasEstoqueController(
        ITransferenciaEstoqueService service,
        ITransferenciaEstoqueExportService exportService)
    {
        _service = service;
        _exportService = exportService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TransferenciaEstoqueLeituraDTO>>> Listar(CancellationToken cancellationToken)
    {
        var lista = await _service.ListarAsync(cancellationToken);
        return Ok(lista);
    }

    [HttpGet("exportar/xlsx")]
    public async Task<IActionResult> ExportarXlsx(CancellationToken cancellationToken) =>
        await ExportarInternoAsync(() => _exportService.ExportarXlsxAsync(cancellationToken));

    [HttpGet("exportar/csv")]
    public async Task<IActionResult> ExportarCsv(CancellationToken cancellationToken) =>
        await ExportarInternoAsync(() => _exportService.ExportarCsvAsync(cancellationToken));

    [HttpPost]
    public async Task<ActionResult<TransferenciaEstoqueLeituraDTO>> CriarEEnviar(
        [FromBody] TransferenciaEstoqueCriacaoDTO dto,
        CancellationToken cancellationToken)
    {
        var resultado = await _service.CriarEEnviarAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(Listar), new { id = resultado.Id }, resultado);
    }

    [HttpPost("{id:int}/receber")]
    public async Task<ActionResult<TransferenciaEstoqueLeituraDTO>> Receber(
        int id,
        CancellationToken cancellationToken)
    {
        var resultado = await _service.ConfirmarRecebimentoAsync(id, cancellationToken);
        return Ok(resultado);
    }

    private async Task<IActionResult> ExportarInternoAsync(Func<Task<ArquivoExportadoDTO>> gerar)
    {
        try
        {
            var arquivo = await gerar();
            return File(arquivo.Conteudo, arquivo.ContentType, arquivo.NomeArquivo);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Falha na exportação",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message,
            });
        }
    }
}
