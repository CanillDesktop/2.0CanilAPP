using Backend.Models.Estoque;

namespace Backend.Services.Interfaces
{
    public interface IRetiradaEstoqueService
    {
        Task<IEnumerable<RetiradaEstoqueModel>> BuscarTodosAsync();
        Task<RetiradaEstoqueModel?> CriarAsync(string lote, RetiradaEstoqueModel obj);
    }
}
