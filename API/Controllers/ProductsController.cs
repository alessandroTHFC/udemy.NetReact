
using System.Collections.Generic;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
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
        public async Task<ActionResult<List<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
   
        }


        //* This Get request will target a specific product on client selection, it will be based off the product id

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
           var product = await _context.Products.FindAsync(id);
           if (product == null) return NotFound();
           return product;
        }
    }
}