namespace Backend.DTOs.Usuario;

public class UsuarioSenhaResumoDTO
{
    public int IdUsuario { get; set; }

    public bool PossuiSenhaDefinida { get; set; }

    /// <summary>
    /// Senhas são armazenadas com hash; o texto original não pode ser recuperado.
    /// </summary>
    public bool SenhaRecuperavel { get; set; }
}
