using Backend.DTOs.Estoque;
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

    public TransferenciasEstoqueController(ITransferenciaEstoqueService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TransferenciaEstoqueLeituraDTO>>> Listar(CancellationToken cancellationToken)
    {
        var lista = await _service.ListarAsync(cancellationToken);
        return Ok(lista);
    }

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
}
