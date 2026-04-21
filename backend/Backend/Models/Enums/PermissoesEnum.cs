using System.ComponentModel;

namespace Backend.Models.Enums
{
    public enum PermissoesEnum
    {
        [Description("Administrador")]
        ADMIN = 1,
        [Description("Comum")]
        LEITURA
    }
}
