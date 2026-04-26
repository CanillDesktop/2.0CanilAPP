namespace Backend.Services.Interfaces
{
    public interface IUserSessionService
    {
        string? UserId { get; }
        string? Email { get; }
        string? Name { get; }
        string? EditedBy { get; }
        string? Role { get; }
    }
}
