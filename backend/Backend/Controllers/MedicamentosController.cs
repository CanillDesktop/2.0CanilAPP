using Backend.DTOs;
using Backend.DTOs.Medicamentos;
using Backend.Exceptions;
using Backend.Filtro.Medicamentos;
using Backend.Models;
using Backend.Models.Medicamentos;
using Backend.Pagination;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MedicamentosController : ControllerBase
    {
        private readonly IMedicamentosService _service;
        private readonly ILogger<MedicamentosController> _logger;

        public MedicamentosController(IMedicamentosService service, ILogger<MedicamentosController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ItemComEstoqueListaPaginadaDTO<MedicamentoLeituraDTO>>> Get(
            [FromQuery] MedicamentosFiltro? filtro,
            [FromQuery] ItensPaginationParameters? paginationParameters,
            CancellationToken cancellationToken)
        {
            var resultado = await _service.BuscarPaginadoAsync(
                filtro ?? new MedicamentosFiltro(),
                paginationParameters ?? new ItensPaginationParameters(),
                cancellationToken);

            return Ok(resultado);
        }


        [HttpGet("{id:int}", Name = "GetMedicamento")]

        public async Task<ActionResult<MedicamentoLeituraDTO>> GetById(int id)
        {
            var medicamento = await _service.BuscarPorIdAsync(id);
            if (medicamento == null)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = "Medicamento não encontrado"
                });
            }

            return Ok(medicamento);
        }


        [HttpPost]
        public async Task<ActionResult<MedicamentoLeituraDTO>> Post(MedicamentoCadastroDTO dto)
        {
            try
            {
                MedicamentosModel model = dto;
                var novoMedicamento = await _service.CriarAsync(model);

                if (novoMedicamento == null)
                {
                    throw new ArgumentNullException(nameof(novoMedicamento));
                }

                return new CreatedAtRouteResult("GetMedicamento",
                    new { id = novoMedicamento.Id }, novoMedicamento);
            }
            catch (ModelIncompletaException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Falha ao criar medicamento",
                    Status = StatusCodes.Status400BadRequest,
                    Details = ex.Message ?? "Um ou mais campos obrigatórios não foram preenchidos"
                });
            }
        }


        [HttpPut("{id}")]

        public async Task<ActionResult<MedicamentoLeituraDTO>> Put(int id, MedicamentoCadastroDTO dto)
        {
            try
            {
                var medicamentoAtualizado = await _service.AtualizarAsync(id, dto);

                return Ok(medicamentoAtualizado);
            }
            catch (ModelIncompletaException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Falha ao atualizar medicamento",
                    Status = StatusCodes.Status400BadRequest,
                    Details = ex.Message ?? "Um ou mais campos obrigatórios não foram preenchidos"
                });
            }
            catch (ArgumentNullException ex)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = ex.Message ?? "Medicamento não encontrado"
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

        public async Task<ActionResult<MedicamentoLeituraDTO>> Delete(int id)
        {
            var sucesso = await _service.DeletarAsync(id);
            if (!sucesso)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = $"Medicamento de id {id} não encontrado"
                });
            }

            return NoContent();
        }
    }
}