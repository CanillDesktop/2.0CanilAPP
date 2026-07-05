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
        private readonly IEstoqueLookupService _lookupService;
        private readonly IEntradaEstoqueService _entradaService;

        public EstoqueController(
            IEstoqueItemService service,
            IEstoqueConsultaService consultaService,
            IEstoqueLookupService lookupService,
            IEntradaEstoqueService entradaService)
        {
            _service = service;
            _consultaService = consultaService;
            _lookupService = lookupService;
            _entradaService = entradaService;
        }

        [HttpGet("lookup/itens")]
        [ProducesResponseType(typeof(PagedResultDto<ItemEstoqueLookupLeituraDTO>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PagedResultDto<ItemEstoqueLookupLeituraDTO>>> LookupItens(
            [FromQuery] EstoqueLookupItensFiltroDTO? filtro,
            [FromQuery] PaginationParameters? parameters,
            CancellationToken cancellationToken)
        {
            var resultado = await _lookupService.BuscarItensAsync(
                filtro ?? new EstoqueLookupItensFiltroDTO(),
                parameters ?? new PaginationParameters(),
                cancellationToken);
            return Ok(resultado);
        }

        [HttpGet("lookup/lotes")]
        [ProducesResponseType(typeof(PagedResultDto<LoteEstoqueLookupLeituraDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PagedResultDto<LoteEstoqueLookupLeituraDTO>>> LookupLotes(
            [FromQuery] EstoqueLookupLotesFiltroDTO filtro,
            [FromQuery] PaginationParameters? parameters,
            CancellationToken cancellationToken)
        {
            try
            {
                var resultado = await _lookupService.BuscarLotesAsync(
                    filtro,
                    parameters ?? new PaginationParameters(),
                    cancellationToken);
                return Ok(resultado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Parâmetros inválidos",
                    Status = StatusCodes.Status400BadRequest,
                    Details = ex.Message,
                });
            }
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


        /// <summary>
        /// Lote (e código do item) gerados pelo backend, apenas para conferência na tela de cadastro.
        /// O usuário nunca edita esses valores.
        /// </summary>
        [HttpGet("proximo-lote/{itemId:int}", Name = "GetProximoLoteEstoque")]
        [ProducesResponseType(typeof(ProximoLoteEstoqueDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProximoLoteEstoqueDTO>> GetProximoLote(int itemId)
        {
            var proximoLote = await _service.GerarProximoLoteAsync(itemId);
            return Ok(proximoLote);
        }

        [HttpPost("entradas")]
        [ProducesResponseType(typeof(ItemEstoqueDTO), StatusCodes.Status201Created)]
        public async Task<IActionResult> RegistrarEntrada([FromBody] EntradaEstoqueDTO dto, CancellationToken cancellationToken)
        {
            var lote = await _entradaService.RegistrarEntradaAsync(dto, cancellationToken);
            ItemEstoqueDTO itemCriado = lote;
            return CreatedAtRoute(
                "GetItemEstoqueByLote",
                new { codigo = itemCriado.Codigo, lote = itemCriado.Lote },
                itemCriado);
        }

        [HttpPost]
        [ProducesResponseType(typeof(ItemEstoqueDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create([FromBody] ItemEstoqueDTO dto)
        {
            var novoItemEstoque = await _service.CriarAsync(dto);

            if (novoItemEstoque == null)
                throw new RecursoNaoEncontradoException("Não foi possível criar o lote.");

            ItemEstoqueDTO itemCriado = novoItemEstoque;

            // Rota nomeada exige código + lote (chave da consulta); informar ambos evita o
            // "No route matches the supplied values" que retornava 500.
            return CreatedAtRoute(
                "GetItemEstoqueByLote",
                new { codigo = itemCriado.Codigo, lote = itemCriado.Lote },
                itemCriado);
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
