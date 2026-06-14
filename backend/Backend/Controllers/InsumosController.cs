using Backend.DTOs;
using Backend.DTOs.Insumos;
using Backend.Exceptions;
using Backend.Filtro.Insumos;
using Backend.Models;
using Backend.Models.Insumos;
using Backend.Pagination;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InsumosController : ControllerBase
    {
        private readonly IInsumosService _service;
        public InsumosController(IInsumosService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<ItemComEstoqueListaPaginadaDTO<InsumosLeituraDTO>>> Get(
            [FromQuery] InsumosFiltro? filtro,
            [FromQuery] ItensPaginationParameters? paginationParameters,
            CancellationToken cancellationToken)
        {
            var resultado = await _service.BuscarPaginadoAsync(
                filtro ?? new InsumosFiltro(),
                paginationParameters ?? new ItensPaginationParameters(),
                cancellationToken);

            return Ok(resultado);
        }

        [HttpGet("{id:int}", Name = "GetInsumo")]
        public async Task<ActionResult<InsumosLeituraDTO>> GetById(int id)
        {
            var insumo = await _service.BuscarPorIdAsync(id);
            if (insumo == null)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = "Insumo não encontrado"
                });
            }

            return Ok(insumo);
        }

        [HttpPost]
        public async Task<IActionResult> Post(InsumosCadastroDTO dto)
        {
            try
            {
                InsumosModel model = dto;
                var novoInsumo = await _service.CriarAsync(model);

                if (novoInsumo == null)
                {
                    throw new ArgumentNullException(nameof(novoInsumo));
                }

                return new CreatedAtRouteResult("GetInsumo",
                    new { id = novoInsumo.Id }, novoInsumo);
            }
            catch (ModelIncompletaException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Falha ao criar insumo",
                    Status = StatusCodes.Status400BadRequest,
                    Details = ex.Message ?? "Um ou mais campos obrigatórios não foram preenchidos"
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<InsumosLeituraDTO>> Put([FromRoute] int id, [FromBody] InsumosCadastroDTO dto)
        {
            try
            {
                var insumoAtualizado = await _service.AtualizarAsync(id, dto);

                return Ok(insumoAtualizado);
            }
            catch (ArgumentNullException ex)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = ex.Message ?? "Insumo não encontrado"
                });
            }
            catch (ConflitoDeConcorrenciaEstoqueException ex)
            {
                return Conflict(new ErrorResponse
                {
                    Title = "Conflito ao atualizar estoque",
                    Status = StatusCodes.Status409Conflict,
                    Details = ex.Message
                });
            }
        }

        [HttpDelete("{id:int}")]

        public async Task<ActionResult<bool>> Delete(int id)
        {
            var sucesso = await _service.DeletarAsync(id);
            if (!sucesso)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = $"Insumo de id {id} não encontrado"
                });
            }

            return NoContent();
        }
    }
}



