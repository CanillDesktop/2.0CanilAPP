using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EstoqueController : ControllerBase
    {
        private readonly EstoqueItemService _service;

        public EstoqueController(EstoqueItemService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemEstoqueDTO>> GetById(int id)
        {
            var model = await _service.BuscarPorIdAsync(id);

            if (model == null)
                return NotFound();


            return Ok(model);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ItemEstoqueDTO dto)
        {
            try
            {
                ItemEstoqueModel model = dto;

                await _service.CriarAsync(model);

                return CreatedAtAction(nameof(GetById), new { id = model.IdItem }, dto);
            }
            catch (ModelIncompletaException ex)
            {
                var erro = new ErrorResponse
                {
                    Title = "Erro ao adicionar lote",
                    Status = StatusCodes.Status400BadRequest,
                    Details = ex.Message
                };
                return StatusCode(erro.Status, erro);
            }
        }

        [HttpPut("{lote}")]
        public async Task<IActionResult> Put([FromBody] ItemEstoqueDTO dto)
        {
            try
            {
                await _service.AtualizarAsync(dto);

                return NoContent();
            }
            catch (ArgumentNullException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{lote}")]
        public async Task<IActionResult> Delete(string lote)
        {
            try
            {
                await _service.DeletarAsync(lote);

                return NoContent();
            }
            catch (ArgumentNullException)
            {
                return NotFound();
            }
        }
    }
}
