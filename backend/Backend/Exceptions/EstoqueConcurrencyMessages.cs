namespace Backend.Exceptions;

/// <summary>Mensagens estáveis para conflitos de concorrência em estoque.</summary>
public static class EstoqueConcurrencyMessages
{
    public const string ItemAlteradoPorOutraOperacao =
        "Este item de estoque foi alterado por outra operação. Recarregue os dados e tente novamente.";

    public const string SaldoInsuficienteOuEstoqueAlterado =
        "Saldo insuficiente ou o estoque foi alterado por outra operação. Atualize a tela e tente novamente.";
}
