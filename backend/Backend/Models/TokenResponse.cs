namespace Backend.Models;

public class TokenResponse
{
    public int ExpiresIn { get; set; }
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string IdToken { get; set; } = string.Empty;
}