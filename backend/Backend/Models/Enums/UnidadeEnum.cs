using System.ComponentModel;

namespace Backend.Models.Enums
{
    public enum UnidadeEnum
    {
        [Description("unidade")]
        UN = 1,
        [Description("caixa")]
        CX,
        [Description("quilo")]
        KG,
        [Description("pacote")]
        PCT
    }
}
