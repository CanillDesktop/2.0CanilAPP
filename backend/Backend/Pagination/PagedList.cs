using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Backend.Pagination
{
    public class PagedList<T> : List<T> where T : class
    {
        public int CurrentPage { get; private set; }
        public int TotalPages { get; private set; }
        public int PageSize { get; private set; } 
        public int TotalCount { get; private set; } = 0;
        public bool HasPrevious => CurrentPage > 1;
        public bool HasNext => CurrentPage < TotalPages;

        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            TotalCount = count;
            PageSize = pageSize > 0 ? pageSize : 3;
            CurrentPage = pageNumber;
            TotalPages = (int)Math.Ceiling(count / (double)PageSize);
            AddRange(items);

        }

        public static PagedList<T> ToPagedList(IQueryable<T> source, int pageNumber, int pageSize)
        {
            var count = source.Count();
            var items = source.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            return new PagedList<T>(items.ToList(), count, pageNumber, pageSize);
        }

        public static PagedList<T> ToPagedList<K>(IQueryable<T> source, int pageNumber, int pageSize, Expression<Func<T, K>> orderByExpression)
        {
            var count = source.Count();
            var items = source.OrderBy(orderByExpression).Skip((pageNumber - 1) * pageSize).Take(pageSize);
            return new PagedList<T>(items.ToList(), count, pageNumber, pageSize);
        }

        public async static Task<PagedList<T>> ToPagedListAsync(IQueryable<T> source, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
        {
            var count = source.Count();
            var items = source.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            return new PagedList<T>(await items.ToListAsync(cancellationToken), count, pageNumber, pageSize);
        }

        public async static Task<PagedList<T>> ToPagedListAsync<K>(IQueryable<T> source, int pageNumber , int pageSize, Expression<Func<T, K>> orderByExpression, CancellationToken cancellationToken = default)
        {
            var count = source.Count();
            var items = source.OrderBy(orderByExpression).Skip((pageNumber - 1) * pageSize).Take(pageSize);
            return new PagedList<T>(await items.ToListAsync(cancellationToken), count, pageNumber, pageSize);
        }
    }
}
