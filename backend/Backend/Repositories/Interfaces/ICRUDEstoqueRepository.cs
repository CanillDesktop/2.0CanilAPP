using Backend.Models.Estoque;

namespace Backend.Repositories.Interfaces
{
    public interface ICRUDEstoqueRepository<T> where T : ItemComEstoqueBaseModel
    {
        Task<IEnumerable<T>> GetAsync();
        Task<T?> GetByIdAsync(int id);
        Task<T> CreateAsync(T obj);
        Task<T?> UpdateAsync(T obj);
        Task<bool> DeleteAsync(T obj);
        /// <summary>Exclui lotes/nível só na unidade ativa; catálogo global só se não restar em outra unidade.</summary>
        Task<bool> DeleteNaUnidadeAtivaAsync(int id, string editor);
    }
}
