using Backend.Exceptions;
using Backend.Models.Estoque;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class RetiradaEstoqueService : IRetiradaEstoqueService
    {
        private readonly IRetiradaEstoqueRepository _repository;
        private readonly IEstoqueItemService _estoqueItemService;

        public RetiradaEstoqueService(IRetiradaEstoqueRepository repository, IEstoqueItemService estoqueItemService)
        {
            _repository = repository;
            _estoqueItemService = estoqueItemService;
        }

        public async Task<IEnumerable<RetiradaEstoqueModel>> BuscarTodosAsync() => await _repository.GetAsync();

        public async Task<RetiradaEstoqueModel?> CriarAsync(string lote, RetiradaEstoqueModel dto)
        {
            if (lote != dto.Lote)
            {
                throw new ArgumentException("O lote do produto requisitado não bate com a rota. Favor contatar suporte");
            }

            var itemEstoque = await _estoqueItemService.BuscarPorLoteAsync(dto.Lote);

            if (itemEstoque == null)
            {
                throw new ArgumentNullException(null, $"Item de estoque de lote {dto.Lote} não encontrado");
            }

            if (itemEstoque.Quantidade - dto.Quantidade < 0)
            {
                throw new RegraDeNegocioInfringidaException("Retirar a quantidade especificada deixaria o estoque com saldo negativo. Retirada não será contabilizada");
            }

            if (string.IsNullOrWhiteSpace(dto.Codigo)
                || string.IsNullOrWhiteSpace(dto.NomeOuDescricaoSimples)
                || string.IsNullOrWhiteSpace(dto.De)
                || string.IsNullOrWhiteSpace(dto.Para))
            {
                throw new ModelIncompletaException("Um ou mais campos obrigatórios não foram preenchidos");
            }

            itemEstoque.Quantidade -= dto.Quantidade;

            await _estoqueItemService.AtualizarAsync(lote, itemEstoque);

            return await _repository.CreateAsync(dto);
        }
    }
}