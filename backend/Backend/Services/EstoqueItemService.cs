using Backend.Exceptions;
using Backend.Models.Estoque;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class EstoqueItemService : IEstoqueItemService
    {
        private readonly IEstoqueItemRepository _repository;
        private readonly IUserSessionService _userSessionService;

        public EstoqueItemService(IEstoqueItemRepository repository, IUserSessionService userSessionService)
        {
            _repository = repository;
            _userSessionService = userSessionService;
        }

        public async Task<IEnumerable<ItemEstoqueModel>> BuscarPorCodigoAsync(string codigo) => await _repository.GetByCodigoAsync(codigo);

        public async Task<ItemEstoqueModel?> BuscarPorLoteAsync(string lote) => await _repository.GetByLoteAsync(lote);

        public async Task<ItemEstoqueModel?> CriarAsync(ItemEstoqueModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Codigo))
            {
                throw new ModelIncompletaException("Um ou mais campos obrigatórios não foram preenchidos");
            }

            return await _repository.CreateAsync(model);
        }

        public async Task<ItemEstoqueModel?> AtualizarAsync(string lote, ItemEstoqueModel model)
        {
            try
            {
                var itemExistente = await _repository.GetByLoteAsync(lote);

                if (itemExistente == null)
                {
                    throw new ArgumentNullException(null, $"Item de estoque de lote {lote} não encontrado");
                }

                itemExistente.Quantidade = model.Quantidade;

                itemExistente.IsDeleted = model.IsDeleted;
                itemExistente.DataHoraAtualizacao = DateTime.UtcNow;
                itemExistente.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

                var result = await _repository.UpdateAsync(itemExistente);
                return result;
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentNullException(null, ex.Message);
            }
        }

        public async Task<bool> DeletarAsync(string lote)
        {
            var itemEstoque = await _repository.GetByLoteAsync(lote);

            if (itemEstoque == null) return false;

            itemEstoque.IsDeleted = true;
            itemEstoque.DataHoraAtualizacao = DateTime.UtcNow;

            return await _repository.DeleteAsync(itemEstoque);
        }
    }
}
