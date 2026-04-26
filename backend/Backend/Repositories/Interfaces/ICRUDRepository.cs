using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface ICRUDRepository<T> where T : BaseModel
    {
        Task<IEnumerable<T>> GetAsync();
        Task<T?> GetByIdAsync(int id);
        Task<T> CreateAsync(T obj);
        Task<T?> UpdateAsync(T obj);
        Task<bool> DeleteAsync(T obj, bool hardDelete = false);
    }
}
