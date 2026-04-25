namespace Backend.Repositories.Interfaces;

public interface IUsuariosRepository<T> : IRepository<T> where T : class
{
    Task<T?> GetByEmailAsync(string email);
    Task<int> CountAsync();
    Task<int> CountAdminsAtivosAsync();
    Task<int> CountAdminsAtivosExcetoAsync(int usuarioId);
}