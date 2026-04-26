using Backend.DTOs.Medicamentos;
using Backend.DTOs.Produtos;
using Backend.Exceptions;
using Backend.Models;
using Backend.Models.Medicamentos;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;
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
        public async Task<ActionResult<IEnumerable<MedicamentoLeituraDTO>>> Get([FromQuery] MedicamentosFiltroDTO filtro)
        {
            var filteredRequest = HttpContext.Request.GetDisplayUrl().Contains('?');

            IEnumerable<MedicamentoLeituraDTO> result;

            if (!filteredRequest || filtro == null)
            {
                result = (await _service.BuscarTodosAsync()).Select(p => (MedicamentoLeituraDTO)p);
            }
            else
            {
                result = (await _service.BuscarTodosAsync(filtro)).Select(p => (MedicamentoLeituraDTO)p);
            }

            return Ok(result);
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
            catch (ArgumentNullException ex)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = ex.Message ?? "Medicamento não encontrado"
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