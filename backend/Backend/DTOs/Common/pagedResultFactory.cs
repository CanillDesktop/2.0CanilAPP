namespace Backend.DTOs.Common;

public static class PagedResultFactory
{
    public static PagedResultDto<T> Create<T>(
        IReadOnlyList<T> items,
        int totalCount,
        int pageNumber,
        int pageSize)
    {
        var safePageNumber = Math.Max(pageNumber, 1);
        var safePageSize = pageSize <= 0 ? 10 : pageSize;
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)safePageSize);

        return new PagedResultDto<T>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = safePageNumber,
            PageSize = safePageSize,
            TotalPages = totalPages,
        };
    }
}