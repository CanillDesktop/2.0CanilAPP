using Backend.DTOs.Common;
using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models;
using Backend.Pagination;
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
        private readonly IEstoqueConsultaService _consultaService;

        public EstoqueController(IEstoqueItemService service, IEstoqueConsultaService consultaService)
        {
            _service = service;
            _consultaService = consultaService;
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
     
        [HttpGet("pagination")]
        [ProducesResponseType(typeof(PagedResultDto<EstoqueLinhaLeituraDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PagedResultDto<EstoqueLinhaLeituraDTO>>> GetPagination(
            [FromQuery] EstoqueFiltroDTO? filtro,
            [FromQuery] EstoqueConsultaParameters? parameters,
            CancellationToken cancellationToken)
        {
            try
            {
                var resultado = await _consultaService.ConsultarPaginadoAsync(
                    filtro ?? new EstoqueFiltroDTO(),
                    parameters ?? new EstoqueConsultaParameters(),
                    cancellationToken);

                return Ok(resultado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Filtros ou paginação inválidos",
                    Status = StatusCodes.Status400BadRequest,
                    Details = ex.Message,
                });
            }
        }

        [HttpGet("contagens")]
        [ProducesResponseType(typeof(EstoqueContagemPorOrigemDTO), StatusCodes.Status200OK)]
        public async Task<ActionResult<EstoqueContagemPorOrigemDTO>> GetContagens(
            CancellationToken cancellationToken)
        {
            var resultado = await _consultaService.ObterContagemPorOrigemAsync(cancellationToken);
            return Ok(resultado);
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
            try
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
    }
}
