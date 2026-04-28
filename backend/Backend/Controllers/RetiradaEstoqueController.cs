using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RetiradaEstoqueController : ControllerBase
    {
        private IRetiradaEstoqueService _service;

        public RetiradaEstoqueController(IRetiradaEstoqueService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RetiradaEstoqueDTO>>> Get()
        {
            var logRetiradas = await _service.BuscarTodosAsync();

            return Ok(logRetiradas);
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
                    Details = ex.Message ?? "Falha ao salvar log de retirada de estoque"
                });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Falha ao salvar log de retirada de estoque",
                    Status = StatusCodes.Status400BadRequest,
                    Details = ex.Message ?? "Item de estoque não encontrado"
                });
            }
            catch (RegraDeNegocioInfringidaException ex)
            {
                return UnprocessableEntity(new ErrorResponse
                {
                    Title = "Falha ao salvar log de retirada de estoque",
                    Status = StatusCodes.Status422UnprocessableEntity,
                    Details = ex.Message ?? "Quantidade de retirada maior que quantidade no estoque"
                });
            }
        }
    }
}
