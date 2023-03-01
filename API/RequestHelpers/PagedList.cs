using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers
{
    //* Setting paged list to type T so its not type specific
    //* and can be used across multiple entities! 
    public class PagedList<T> : List<T>
    {
        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            MetaData = new MetaData
            {
                TotalCount = count, 
                PageSize = pageSize, 
                CurrentPage = pageNumber, 
                TotalPages = (int)Math.Ceiling(count / (double)pageSize) //! typecasting to double because ceiling expects it!
            };

            AddRange(items);
        }

        public MetaData MetaData { get; set; }

        public static async Task<PagedList<T>> ToPagedList(IQueryable<T> query, int pageNumber, int pageSize)
        {
            var count = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            //* COMMENT:  (Example Explanation) We have Page Size of 10 
            //* If on page 2... we minus 1 to equal one. multiplied by 10(pageSize) = 10
            //* So we skip 10 records, and take the next 10 records. So we have gotten the second lot of 10 records, thus second page! 

            return new PagedList<T>(items, count, pageNumber, pageSize);
        }
    }
}