namespace Backend.Pagination;


public class PaginationParameters
{
    private const int MaxPageSize = 50;
    private const int DefaultPageSize = 10;

    public int PageNumber { get; set; } = 1;

    private int _pageSize = DefaultPageSize;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value <= 0
            ? DefaultPageSize
            : value > MaxPageSize ? MaxPageSize : value;
    }
    public int NormalizedPageNumber => Math.Max(PageNumber, 1);
}