using Backend.DTOs.Busca;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BuscaController : ControllerBase
    {
        private readonly IProdutosService _produtosService;
        private readonly IMedicamentosService _medicamentosService;
        private readonly IInsumosService _insumosService;

        public BuscaController(
            IProdutosService produtosService,
            IMedicamentosService medicamentosService,
            IInsumosService insumosService)
        {
            _produtosService = produtosService;
            _medicamentosService = medicamentosService;
            _insumosService = insumosService;
        }

        private static bool ContemTermo(string? texto, string termo)
        {
            return !string.IsNullOrWhiteSpace(texto)
                   && texto.Contains(termo, StringComparison.OrdinalIgnoreCase);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BuscaItemDTO>>> Buscar([FromQuery] string? q)
        {
            var termo = (q ?? string.Empty).Trim();
            if (termo.Length < 2)
            {
                return Ok(Array.Empty<BuscaItemDTO>());
            }

            var produtosTask = _produtosService.BuscarTodosAsync(new DTOs.Produtos.ProdutosFiltroDTO());
            var medicamentosTask = _medicamentosService.BuscarTodosAsync(new DTOs.Medicamentos.MedicamentosFiltroDTO());
            var insumosTask = _insumosService.BuscarTodosAsync(new DTOs.Insumos.InsumosFiltroDTO());

            await Task.WhenAll(produtosTask, medicamentosTask, insumosTask);

            var resultados = new List<BuscaItemDTO>();
            resultados.AddRange(produtosTask.Result
                .Where(item =>
                    ContemTermo(item.NomeItem, termo)
                    || ContemTermo(item.CodItem, termo)
                    || ContemTermo(item.DescricaoDetalhada, termo))
                .Select(item => new BuscaItemDTO
                {
                    Id = item.IdItem,
                    Nome = item.NomeItem,
                    Tipo = "produto_retirada"
                }));
            resultados.AddRange(medicamentosTask.Result
                .Where(item =>
                    ContemTermo(item.NomeItem, termo)
                    || ContemTermo(item.CodItem, termo)
                    || ContemTermo(item.DescricaoMedicamento, termo)
                    || ContemTermo(item.Formula, termo))
                .Select(item => new BuscaItemDTO
                {
                    Id = item.IdItem,
                    Nome = item.NomeItem,
                    Tipo = "medicamento"
                }));
            resultados.AddRange(insumosTask.Result
                .Where(item =>
                    ContemTermo(item.NomeItem, termo)
                    || ContemTermo(item.CodItem, termo)
                    || ContemTermo(item.DescricaoDetalhada, termo))
                .Select(item => new BuscaItemDTO
                {
                    Id = item.IdItem,
                    Nome = item.NomeItem,
                    Tipo = "insumo"
                }));

            return Ok(resultados
                .OrderBy(item => item.Nome)
                .Take(30)
                .ToArray());
        }
    }
}
