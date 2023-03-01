
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Extensions;
using API.RequestHelpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class ProductsController : BaseApiController
    {
        private readonly StoreContext _context;

        public ProductsController(StoreContext context)
        {
            _context = context;
        }

        // =================================================================================================================\\
        // =================================================================================================================\\
        //* This Get request will return all the products inside the store context products list
        //* This is a Synchronous API call, which in low site use conditions will return very fast, however
        //* because they are run off of threads, the thread does not return until it has retrieved or there has been an error
        //* This can be problematic and could block up the threads causing usage issues and timeouts for clients.
        //! [HttpGet]
        //! public ActionResult<List<Product>> GetProducts()
        //! {
        //!     var products = await context.Products.ToList();
        //!     return Ok(products);
        //! }
        // =================================================================================================================\\
        // =================================================================================================================\\



        //* The below API call is asynchronous! 
        [HttpGet]
        // ! COMMENT:  By convention, the API controller will presume if we have strings as parameters, they will be query strings. (i.e how was before we added the object, string orderBy, string types etc.)
        // ! COMMENT:  If were passing an obj as param, it will presume it will get these values from the body of the request (bad!) to fix this issue, we just need to add [FromQuery]. 
        public async Task<ActionResult<PagedList<Product>>> GetProducts([FromQuery]ProductParams productParams) 
        {
            // COMMENT: Prev: return await _context.Products.ToListAsync();
            // COMMENT: changes to below because we are introducing the ability to sort data so we dont need to return all products at once.
            // COMMENT: instead just returning the products the user wants to see. 
            var query = _context.Products
                .Sort(productParams.OrderBy)        //* COMMENT: custom product extension to sort the data based on orderBy string
                .Search(productParams.SearchTerm)
                .Filter(productParams.Brands, productParams.Types)
                .AsQueryable();

           
            // COMMENT: Exits switch and then makes the query to the database
            var products = await PagedList<Product>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);

            Response.AddPaginationHeader(products.MetaData); 
            return products;
        }


        //* COMMENT: This Get request will target a specific product on client selection, it will be based off the product id

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
           var product = await _context.Products.FindAsync(id);
           if (product == null) return NotFound();
           return product;
        }


        //* COMMENT: This Get Request is something we can use in our client app to get lists of the brands and types
        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters()
        {
            var brands = await _context.Products.Select(p => p.Brand).Distinct().ToListAsync();
            var types = await _context.Products.Select(p => p.Type).Distinct().ToListAsync();

            return Ok(new {brands, types});
        }

    }
}