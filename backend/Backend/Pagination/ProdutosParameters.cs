namespace Backend.Pagination;

public class ProdutosParameters
{
    private const int MaxPageSize = 50;
    private const int DefaultPageSize = 10;

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
}
