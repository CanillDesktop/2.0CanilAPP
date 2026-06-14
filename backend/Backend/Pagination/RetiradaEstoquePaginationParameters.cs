namespace Backend.Pagination;

public class RetiradaEstoquePaginationParameters
{
    private const int MaxPageSize = 100;
    private const int DefaultPageSize = 20;

    public int PageNumber { get; set; } = 1;

    private int _pageSize = DefaultPageSize;

    public int PageSize
    {
        get => _pageSize;
        set
        {
            if (value <= 0)
                _pageSize = DefaultPageSize;
            else
                _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }
    }

    /// <summary>
    /// Quando verdadeiro, ordena por data/hora do mais antigo ao mais novo.
    /// Padrão falso — mais recente primeiro.
    /// </summary>
    public bool OrdemDataAscendente { get; set; }
}
