using Backend.DTOs.Produtos;
using Backend.Exceptions;
using Backend.Models;
using Backend.Models.Produtos;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Backend.Pagination;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProdutosController : ControllerBase
    {
        private readonly IProdutosService _service;
        private readonly ILogger<ProdutosController> _logger;

        public ProdutosController(IProdutosService service, ILogger<ProdutosController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("pagination")]
        public async Task<ActionResult<IEnumerable<ProdutosLeituraDTO>>> Get([FromQuery] ProdutosFiltroDTO filtro, [FromQuery] ProdutosParameters produtosParameters)
        {
            var pagedResult = await _service.BuscarTodosAsync(filtro, produtosParameters);

            var result = pagedResult.Select(p => (ProdutosLeituraDTO)p);

            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetProduto")]
        public async Task<ActionResult<ProdutosLeituraDTO>> GetById(int id)
        {
            var produto = await _service.BuscarPorIdAsync(id);
            if (produto == null)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = "Produto não encontrado"
                });
            }

            return Ok(produto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProdutosCadastroDTO dto)
        {
            try
            {
                ProdutosModel model = dto;
                var novoProduto = await _service.CriarAsync(model);

                if (novoProduto == null)
                {
                    throw new ArgumentNullException(nameof(novoProduto));
                }

                return new CreatedAtRouteResult("GetProduto",
                    new { id = novoProduto.Id }, novoProduto);
            }
            catch (ModelIncompletaException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Falha ao criar produto",
                    Status = StatusCodes.Status400BadRequest,
                    Details = ex.Message ?? "Um ou mais campos obrigatórios não foram preenchidos"
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProdutosLeituraDTO>> Put([FromRoute] int id, [FromBody] ProdutosCadastroDTO dto)
        {
            try
            {
                var produtoAtualizado = await _service.AtualizarAsync(id, dto);

                return Ok(produtoAtualizado);
            }
            catch (ArgumentNullException ex)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = ex.Message ?? "Produto não encontrado"
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var sucesso = await _service.DeletarAsync(id);
            if (!sucesso)
            {
                return NotFound(new ErrorResponse
                {
                    Title = "Recurso não encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Details = $"Produto de id {id} não encontrado"
                });
            }

            return NoContent();
        }
    }
}