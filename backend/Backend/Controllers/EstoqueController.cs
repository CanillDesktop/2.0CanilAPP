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
    public class EstoqueController : ControllerBase
    {
        private readonly IEstoqueItemService _service;

        public EstoqueController(IEstoqueItemService service)
        {
            _service = service;
        }

        [HttpGet("{codigo}", Name = "GetItensEstoqueByCodigo")]
        public async Task<ActionResult<ItemEstoqueDTO>> GetById(string codigo)
        {
            var itensEstoque = await _service.BuscarPorCodigoAsync(codigo);

            return Ok(itensEstoque);
        }

        [HttpGet("{codigo}/{lote}", Name = "GetItemEstoqueByLote")]
        public async Task<ActionResult<ItemEstoqueDTO>> GetByLote(string codigo, string lote)
        {
            var itemEstoque = await _service.BuscarPorLoteAsync(lote);
            if (itemEstoque == null)
                return NotFound(new ErrorResponse
                {
                    Title = "Item de estoque não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = "Item de estoque não encontrado"
                });

            if (codigo != itemEstoque.Codigo)
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Falha no roteamento",
                    Status = StatusCodes.Status400BadRequest,
                    Details = "Lote não pertence ao item especificado"
                });
            }

            return Ok(itemEstoque);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ItemEstoqueDTO dto)
        {
            try
            {
                var novoItemEstoque = await _service.CriarAsync(dto);

                if (novoItemEstoque == null)
                    throw new ArgumentNullException();

                return new CreatedAtRouteResult("GetItemEstoqueByLote",
                    new { lote = novoItemEstoque.Lote }, novoItemEstoque);
            }
            catch (ModelIncompletaException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Erro ao adicionar um novo lote ao item",
                    Status = StatusCodes.Status400BadRequest,
                    Details = ex.Message ?? "Erro ao adicionar um novo lote ao item"
                });
            }
        }

        [HttpDelete("{lote}")]
        public async Task<IActionResult> Delete(string lote)
        {
            var sucesso = await _service.DeletarAsync(lote);
            if (!sucesso)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = $"Item de estoque de lote {lote} não encontrado"
                });
            }

            return NoContent();
        }
    }
}
