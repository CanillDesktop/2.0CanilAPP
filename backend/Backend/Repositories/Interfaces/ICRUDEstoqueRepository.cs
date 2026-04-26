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
    }
}
