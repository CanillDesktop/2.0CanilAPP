namespace Backend.Models;

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public RefreshToken RefreshToken { get; set; } = null!;
}