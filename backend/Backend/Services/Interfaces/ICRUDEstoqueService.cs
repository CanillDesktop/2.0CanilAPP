namespace Backend.Services.Interfaces
{
    public interface ICRUDEstoqueService<T>
    {
        Task<IEnumerable<T>> BuscarTodosAsync();
        Task<T?> BuscarPorIdAsync(int id);
        Task<T?> CriarAsync(T obj);
        Task<T?> AtualizarAsync(int id, T obj);
        Task<bool> DeletarAsync(int id);
    }
}
